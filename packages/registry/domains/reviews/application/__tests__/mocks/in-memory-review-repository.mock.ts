import type { Review } from "../../../domain/entities/review.entity.js";
import type {
  IReviewRepository,
  ReviewFilters,
  RatingDistribution,
} from "../../ports/review-repository.port.js";

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews = new Map<string, Review>();

  async save(review: Review): Promise<void> {
    this.reviews.set(review.id, review);
  }

  async findById(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async findByAuthorAndResource(
    authorId: string,
    resourceId: string,
    resourceType: string,
  ): Promise<Review | undefined> {
    for (const review of this.reviews.values()) {
      if (
        review.authorId === authorId &&
        review.resourceId === resourceId &&
        review.resourceType === resourceType &&
        !review.moderationStatus.isRejected()
      ) {
        return review;
      }
    }
    return undefined;
  }

  async findByResource(
    resourceId: string,
    resourceType: string,
    filters: ReviewFilters,
  ): Promise<{ reviews: Review[]; total: number }> {
    let matches = Array.from(this.reviews.values()).filter(
      (r) => r.resourceId === resourceId && r.resourceType === resourceType,
    );

    if (filters.moderationStatus) {
      matches = matches.filter(
        (r) => r.moderationStatus.value === filters.moderationStatus,
      );
    }

    const total = matches.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? matches.length;
    const reviews = matches.slice(offset, offset + limit);

    return { reviews, total };
  }

  async computeRatingDistribution(
    resourceId: string,
    resourceType: string,
  ): Promise<RatingDistribution> {
    const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const review of this.reviews.values()) {
      if (
        review.resourceId === resourceId &&
        review.resourceType === resourceType &&
        review.moderationStatus.isApproved()
      ) {
        const star = review.rating.value as 1 | 2 | 3 | 4 | 5;
        distribution[star]++;
      }
    }

    return distribution;
  }
}
