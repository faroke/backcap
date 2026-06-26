import type { Review } from "../../domain/entities/review.entity.js";
import type { ModerationStatusValue } from "../../domain/value-objects/moderation-status.vo.js";

export interface ReviewFilters {
  moderationStatus?: ModerationStatusValue | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface IReviewRepository {
  save(review: Review): Promise<void>;
  findById(id: string): Promise<Review | undefined>;
  /**
   * Returns an existing review only if its moderationStatus is pending or approved.
   * Rejected reviews do not block the author from submitting a new review
   * for the same resource (resubmission is allowed).
   */
  findByAuthorAndResource(
    authorId: string,
    resourceId: string,
    resourceType: string,
  ): Promise<Review | undefined>;
  findByResource(
    resourceId: string,
    resourceType: string,
    filters: ReviewFilters,
  ): Promise<{ reviews: Review[]; total: number }>;
  /**
   * Counts ratings only for approved reviews.
   * Pending and rejected reviews must not affect public scores.
   */
  computeRatingDistribution(
    resourceId: string,
    resourceType: string,
  ): Promise<RatingDistribution>;
}
