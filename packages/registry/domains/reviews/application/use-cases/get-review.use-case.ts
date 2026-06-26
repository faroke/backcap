import { Result } from "../../shared/result.js";
import { ReviewNotFound } from "../../domain/errors/review-not-found.error.js";
import type { IReviewRepository } from "../ports/review-repository.port.js";
import type { GetReviewInput, GetReviewOutput } from "../dto/get-review.dto.js";

export class GetReview {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: GetReviewInput): Promise<Result<GetReviewOutput, ReviewNotFound>> {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) {
      return Result.fail(ReviewNotFound.create(input.reviewId));
    }

    return Result.ok({
      reviewId: review.id,
      rating: review.rating.value,
      body: review.body?.value,
      authorId: review.authorId,
      resourceId: review.resourceId,
      resourceType: review.resourceType,
      moderationStatus: review.moderationStatus.value,
      createdAt: review.createdAt,
      moderatedAt: review.moderatedAt,
      moderatorId: review.moderatorId,
    });
  }
}
