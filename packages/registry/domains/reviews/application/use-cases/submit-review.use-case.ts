import { Result } from "../../shared/result.js";
import { Review } from "../../domain/entities/review.entity.js";
import { ReviewSubmitted } from "../../domain/events/review-submitted.event.js";
import { DuplicateReview } from "../../domain/errors/duplicate-review.error.js";
import type { IReviewRepository } from "../ports/review-repository.port.js";
import type { SubmitReviewInput, SubmitReviewOutput } from "../dto/submit-review.dto.js";

export class SubmitReview {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    input: SubmitReviewInput,
  ): Promise<Result<{ output: SubmitReviewOutput; event: ReviewSubmitted }, Error>> {
    const existing = await this.reviewRepository.findByAuthorAndResource(
      input.authorId,
      input.resourceId,
      input.resourceType,
    );
    if (existing) {
      return Result.fail(DuplicateReview.create(input.authorId, input.resourceId, input.resourceType));
    }

    const id = crypto.randomUUID();
    const reviewResult = Review.create({
      id,
      rating: input.rating,
      body: input.body,
      authorId: input.authorId,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
    });

    if (reviewResult.isFail()) {
      return Result.fail(reviewResult.unwrapError());
    }

    const review = reviewResult.unwrap();
    await this.reviewRepository.save(review);

    const event = new ReviewSubmitted(
      review.id,
      review.authorId,
      review.resourceId,
      review.resourceType,
      review.rating.value,
    );

    return Result.ok({
      output: { reviewId: review.id, createdAt: review.createdAt },
      event,
    });
  }
}
