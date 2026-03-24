import { Result } from "../../shared/result.js";
import type { IReviewRepository } from "../ports/review-repository.port.js";
import type { ListReviewsInput, ListReviewsOutput } from "../dto/list-reviews.dto.js";

export class ListReviews {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: ListReviewsInput): Promise<Result<ListReviewsOutput, Error>> {
    const { reviews, total } = await this.reviewRepository.findByResource(
      input.resourceId,
      input.resourceType,
      {
        moderationStatus: input.moderationStatus ?? "approved",
        limit: input.limit,
        offset: input.offset,
      },
    );

    return Result.ok({
      reviews: reviews.map((r) => ({
        reviewId: r.id,
        rating: r.rating.value,
        body: r.body?.value,
        authorId: r.authorId,
        moderationStatus: r.moderationStatus.value,
        createdAt: r.createdAt,
      })),
      total,
    });
  }
}
