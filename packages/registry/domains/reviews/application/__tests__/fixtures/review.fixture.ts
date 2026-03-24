import { Review } from "../../../domain/entities/review.entity.js";
import { ModerationStatus } from "../../../domain/value-objects/moderation-status.vo.js";

export function createTestReview(
  overrides?: Partial<{
    id: string;
    rating: number;
    body: string;
    authorId: string;
    resourceId: string;
    resourceType: string;
    moderationStatus: ModerationStatus;
  }>,
): Review {
  const result = Review.create({
    id: overrides?.id ?? "test-review-1",
    rating: overrides?.rating ?? 4,
    body: overrides?.body ?? "Great product!",
    authorId: overrides?.authorId ?? "author-1",
    resourceId: overrides?.resourceId ?? "product-1",
    resourceType: overrides?.resourceType ?? "product",
    moderationStatus: overrides?.moderationStatus,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test review: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
