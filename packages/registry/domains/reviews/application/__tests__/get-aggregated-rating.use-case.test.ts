import { describe, it, expect, beforeEach } from "vitest";
import { GetAggregatedRating } from "../use-cases/get-aggregated-rating.use-case.js";
import { InMemoryReviewRepository } from "./mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "./fixtures/review.fixture.js";
import { ModerationStatus } from "../../domain/value-objects/moderation-status.vo.js";

describe("GetAggregatedRating", () => {
  let repository: InMemoryReviewRepository;
  let useCase: GetAggregatedRating;

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    useCase = new GetAggregatedRating(repository);
  });

  it("computes aggregated rating for a resource with multiple reviews", async () => {
    const reviews = [
      createTestReview({ id: "r-1", authorId: "a-1", rating: 3, moderationStatus: ModerationStatus.approved() }),
      createTestReview({ id: "r-2", authorId: "a-2", rating: 4, moderationStatus: ModerationStatus.approved() }),
      createTestReview({ id: "r-3", authorId: "a-3", rating: 5, moderationStatus: ModerationStatus.approved() }),
      createTestReview({ id: "r-4", authorId: "a-4", rating: 5, moderationStatus: ModerationStatus.approved() }),
    ];

    for (const review of reviews) {
      await repository.save(review);
    }

    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.average).toBe(4.25);
    expect(output.count).toBe(4);
    expect(output.distribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 });
  });

  it("returns average 0 and count 0 for resource with no reviews", async () => {
    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.average).toBe(0);
    expect(output.count).toBe(0);
  });

  it("correctly rounds average to 2 decimal places", async () => {
    const reviews = [
      createTestReview({ id: "r-1", authorId: "a-1", rating: 1, moderationStatus: ModerationStatus.approved() }),
      createTestReview({ id: "r-2", authorId: "a-2", rating: 5, moderationStatus: ModerationStatus.approved() }),
      createTestReview({ id: "r-3", authorId: "a-3", rating: 5, moderationStatus: ModerationStatus.approved() }),
    ];

    for (const review of reviews) {
      await repository.save(review);
    }

    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
    });

    // (1 + 5 + 5) / 3 = 3.666... => 3.67
    expect(result.unwrap().average).toBe(3.67);
  });
});
