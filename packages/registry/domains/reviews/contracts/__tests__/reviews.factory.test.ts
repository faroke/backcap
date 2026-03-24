import { describe, it, expect, beforeEach, vi } from "vitest";
import { createReviewsService } from "../reviews.factory.js";
import { InMemoryReviewRepository } from "../../application/__tests__/mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "../../application/__tests__/fixtures/review.fixture.js";
import type { IReviewsService } from "../reviews.contract.js";

describe("createReviewsService", () => {
  let repository: InMemoryReviewRepository;
  let service: IReviewsService;
  let eventBus: { publish: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    service = createReviewsService({ reviewRepository: repository, eventBus });
  });

  it("submitReview delegates and returns Result<SubmitReviewOutput> (event stripped)", async () => {
    const result = await service.submitReview({
      rating: 5,
      body: "Great!",
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.reviewId).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
    // event should be stripped — output should not have an 'event' key
    expect(output).not.toHaveProperty("event");
  });

  it("submitReview publishes ReviewSubmitted via eventBus on success", async () => {
    await service.submitReview({
      rating: 5,
      body: "Great!",
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(eventBus.publish).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledWith("ReviewSubmitted", expect.objectContaining({
      authorId: "author-1",
      rating: 5,
    }));
  });

  it("submitReview does not publish event on failure (duplicate review)", async () => {
    const existing = createTestReview();
    await repository.save(existing);

    await service.submitReview({
      rating: 5,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("moderateReview publishes ReviewModerated via eventBus on success", async () => {
    const review = createTestReview({ id: "r-1" });
    await repository.save(review);

    await service.moderateReview({
      reviewId: "r-1",
      moderatorId: "mod-1",
      decision: "approve",
    });

    expect(eventBus.publish).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledWith("ReviewModerated", expect.objectContaining({
      reviewId: "r-1",
      newStatus: "approved",
    }));
  });

  it("moderateReview does not publish event on failure (review not found)", async () => {
    await service.moderateReview({
      reviewId: "non-existent",
      moderatorId: "mod-1",
      decision: "approve",
    });

    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("factory works without eventBus", async () => {
    const serviceNoEvents = createReviewsService({ reviewRepository: repository });

    const result = await serviceNoEvents.submitReview({
      rating: 4,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
  });
});
