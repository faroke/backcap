import { describe, it, expect, beforeEach } from "vitest";
import { GetReview } from "../use-cases/get-review.use-case.js";
import { InMemoryReviewRepository } from "./mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "./fixtures/review.fixture.js";
import { Review } from "../../domain/entities/review.entity.js";
import { ReviewNotFound } from "../../domain/errors/review-not-found.error.js";

describe("GetReview", () => {
  let repository: InMemoryReviewRepository;
  let useCase: GetReview;

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    useCase = new GetReview(repository);
  });

  it("returns review details for existing review", async () => {
    const review = createTestReview({ id: "r-1", rating: 4, body: "Great!" });
    await repository.save(review);

    const result = await useCase.execute({ reviewId: "r-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.reviewId).toBe("r-1");
    expect(output.rating).toBe(4);
    expect(output.body).toBe("Great!");
    expect(output.moderationStatus).toBe("pending");
  });

  it("returns undefined body for rating-only review", async () => {
    const reviewResult = Review.create({
      id: "r-2",
      rating: 3,
      authorId: "author-1",
      resourceId: "product-1",
      resourceType: "product",
    });
    await repository.save(reviewResult.unwrap());

    const result = await useCase.execute({ reviewId: "r-2" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().body).toBeUndefined();
  });

  it("fails with ReviewNotFound for non-existent review", async () => {
    const result = await useCase.execute({ reviewId: "non-existent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewNotFound);
  });
});
