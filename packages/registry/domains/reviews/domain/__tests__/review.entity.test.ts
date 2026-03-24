import { describe, it, expect } from "vitest";
import { Review } from "../entities/review.entity.js";
import { ReviewAlreadyModerated } from "../errors/review-already-moderated.error.js";
import { InvalidRating } from "../errors/invalid-rating.error.js";

describe("Review", () => {
  const validParams = {
    id: "review-1",
    rating: 4,
    body: "Great product!",
    authorId: "author-1",
    resourceId: "product-1",
    resourceType: "product",
  };

  it("creates a review with required fields", () => {
    const result = Review.create(validParams);
    expect(result.isOk()).toBe(true);
    const review = result.unwrap();
    expect(review.rating.value).toBe(4);
    expect(review.authorId).toBe("author-1");
    expect(review.resourceId).toBe("product-1");
    expect(review.resourceType).toBe("product");
  });

  it("creates a review with optional body", () => {
    const result = Review.create(validParams);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().body?.value).toBe("Great product!");
  });

  it("creates a rating-only review (no body)", () => {
    const { body: _, ...paramsWithoutBody } = validParams;
    const result = Review.create(paramsWithoutBody);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().body).toBeUndefined();
  });

  it("defaults moderationStatus to pending", () => {
    const result = Review.create(validParams);
    expect(result.unwrap().moderationStatus.value).toBe("pending");
  });

  it("defaults createdAt to current date", () => {
    const before = new Date();
    const result = Review.create(validParams);
    const after = new Date();
    const createdAt = result.unwrap().createdAt;
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it.each([0, 6, 3.5])("fails with invalid rating %d", (rating) => {
    const result = Review.create({ ...validParams, rating });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("fails with empty body when body is provided as empty string", () => {
    const result = Review.create({ ...validParams, body: "" });
    expect(result.isFail()).toBe(true);
  });

  it("approve() transitions pending to approved", () => {
    const review = Review.create(validParams).unwrap();
    const result = review.approve("mod-1");
    expect(result.isOk()).toBe(true);
    const approved = result.unwrap();
    expect(approved.moderationStatus.value).toBe("approved");
    expect(approved.moderatorId).toBe("mod-1");
    expect(approved.moderatedAt).toBeInstanceOf(Date);
  });

  it("reject() transitions pending to rejected", () => {
    const review = Review.create(validParams).unwrap();
    const result = review.reject("mod-1");
    expect(result.isOk()).toBe(true);
    const rejected = result.unwrap();
    expect(rejected.moderationStatus.value).toBe("rejected");
    expect(rejected.moderatorId).toBe("mod-1");
    expect(rejected.moderatedAt).toBeInstanceOf(Date);
  });

  it("approve() fails on already-approved review", () => {
    const review = Review.create(validParams).unwrap();
    const approved = review.approve("mod-1").unwrap();
    const result = approved.approve("mod-2");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });

  it("reject() fails on already-rejected review", () => {
    const review = Review.create(validParams).unwrap();
    const rejected = review.reject("mod-1").unwrap();
    const result = rejected.reject("mod-2");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });

  it("reject() fails on already-approved review (cross-moderation)", () => {
    const review = Review.create(validParams).unwrap();
    const approved = review.approve("mod-1").unwrap();
    const result = approved.reject("mod-2");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });

  it("approve() fails on already-rejected review (cross-moderation)", () => {
    const review = Review.create(validParams).unwrap();
    const rejected = review.reject("mod-1").unwrap();
    const result = rejected.approve("mod-2");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });

  it("original entity is unchanged after approve (immutability)", () => {
    const review = Review.create(validParams).unwrap();
    review.approve("mod-1");
    expect(review.moderationStatus.value).toBe("pending");
    expect(review.moderatorId).toBeUndefined();
    expect(review.moderatedAt).toBeUndefined();
  });
});
