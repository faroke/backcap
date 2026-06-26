import { Result } from "../../shared/result.js";
import { ReviewNotFound } from "../../domain/errors/review-not-found.error.js";
import { ReviewAlreadyModerated } from "../../domain/errors/review-already-moderated.error.js";
import { ReviewModerated } from "../../domain/events/review-moderated.event.js";
import type { IReviewRepository } from "../ports/review-repository.port.js";
import type { ModerateReviewInput, ModerateReviewOutput } from "../dto/moderate-review.dto.js";

export class ModerateReview {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    input: ModerateReviewInput,
  ): Promise<
    Result<
      { output: ModerateReviewOutput; event: ReviewModerated },
      ReviewNotFound | ReviewAlreadyModerated
    >
  > {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) {
      return Result.fail(ReviewNotFound.create(input.reviewId));
    }

    const moderateResult =
      input.decision === "approve"
        ? review.approve(input.moderatorId)
        : review.reject(input.moderatorId);

    if (moderateResult.isFail()) {
      return Result.fail(moderateResult.unwrapError());
    }

    const moderated = moderateResult.unwrap();
    await this.reviewRepository.save(moderated);

    const event = new ReviewModerated(
      moderated.id,
      input.moderatorId,
      moderated.moderationStatus.value,
    );

    return Result.ok({
      output: {
        moderatedAt: moderated.moderatedAt ?? new Date(),
        newStatus: moderated.moderationStatus.value,
      },
      event,
    });
  }
}
