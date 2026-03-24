import { describe, it, expect, beforeEach } from "vitest";
import { ListReviews } from "../use-cases/list-reviews.use-case.js";
import { InMemoryReviewRepository } from "./mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "./fixtures/review.fixture.js";
import { ModerationStatus } from "../../domain/value-objects/moderation-status.vo.js";

describe("ListReviews", () => {
  let repository: InMemoryReviewRepository;
  let useCase: ListReviews;

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    useCase = new ListReviews(repository);
  });

  it("lists approved reviews for a resource (default filter)", async () => {
    const pending = createTestReview({ id: "r-1" });
    const approved = createTestReview({ id: "r-2", authorId: "author-2", moderationStatus: ModerationStatus.approved() });
    const rejected = createTestReview({ id: "r-3", authorId: "author-3", moderationStatus: ModerationStatus.rejected() });

    await repository.save(pending);
    await repository.save(approved);
    await repository.save(rejected);

    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.reviews).toHaveLength(1);
    expect(output.reviews[0].reviewId).toBe("r-2");
    expect(output.total).toBe(1);
  });

  it("filters by moderationStatus when explicitly provided", async () => {
    const pending = createTestReview({ id: "r-1" });
    const approved = createTestReview({ id: "r-2", authorId: "author-2", moderationStatus: ModerationStatus.approved() });

    await repository.save(pending);
    await repository.save(approved);

    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
      moderationStatus: "pending",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().reviews).toHaveLength(1);
    expect(result.unwrap().reviews[0].reviewId).toBe("r-1");
  });

  it("returns empty list when no reviews match", async () => {
    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().reviews).toHaveLength(0);
    expect(result.unwrap().total).toBe(0);
  });

  it("respects limit and offset", async () => {
    const r1 = createTestReview({ id: "r-1", authorId: "a-1", moderationStatus: ModerationStatus.approved() });
    const r2 = createTestReview({ id: "r-2", authorId: "a-2", moderationStatus: ModerationStatus.approved() });
    const r3 = createTestReview({ id: "r-3", authorId: "a-3", moderationStatus: ModerationStatus.approved() });

    await repository.save(r1);
    await repository.save(r2);
    await repository.save(r3);

    const result = await useCase.execute({
      resourceId: "product-1",
      resourceType: "product",
      limit: 1,
      offset: 1,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().reviews).toHaveLength(1);
    expect(result.unwrap().total).toBe(3);
  });
});
