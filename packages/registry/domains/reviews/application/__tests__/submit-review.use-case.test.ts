import { describe, it, expect, beforeEach } from "vitest";
import { SubmitReview } from "../use-cases/submit-review.use-case.js";
import { InMemoryReviewRepository } from "./mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "./fixtures/review.fixture.js";
import { DuplicateReview } from "../../domain/errors/duplicate-review.error.js";
import { ReviewSubmitted } from "../../domain/events/review-submitted.event.js";
import { ModerationStatus } from "../../domain/value-objects/moderation-status.vo.js";

describe("SubmitReview", () => {
  let repository: InMemoryReviewRepository;
  let useCase: SubmitReview;

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    useCase = new SubmitReview(repository);
  });

  it("submits a review successfully", async () => {
    const result = await useCase.execute({
      rating: 5,
      body: "Excellent!",
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.reviewId).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(event).toBeInstanceOf(ReviewSubmitted);
    expect(event.rating).toBe(5);
    expect(event.authorId).toBe("author-1");
  });

  it("submits a rating-only review (no body)", async () => {
    const result = await useCase.execute({
      rating: 3,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
  });

  it("fails with invalid rating (0)", async () => {
    const result = await useCase.execute({
      rating: 0,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isFail()).toBe(true);
  });

  it("fails with DuplicateReview when author already reviewed the resource", async () => {
    const existing = createTestReview();
    await repository.save(existing);

    const result = await useCase.execute({
      rating: 5,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(DuplicateReview);
  });

  it("allows same author to review same resourceId with different resourceType", async () => {
    const existing = createTestReview();
    await repository.save(existing);

    const result = await useCase.execute({
      rating: 5,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "service",
    });

    expect(result.isOk()).toBe(true);
  });

  it("allows resubmission after a previous review was rejected", async () => {
    const existing = createTestReview({ moderationStatus: ModerationStatus.rejected() });
    await repository.save(existing);

    const result = await useCase.execute({
      rating: 5,
      body: "Improved review",
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isOk()).toBe(true);
  });

  it("fails with invalid body (empty string when provided)", async () => {
    const result = await useCase.execute({
      rating: 4,
      body: "",
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });

    expect(result.isFail()).toBe(true);
  });
});
