import { describe, it, expect } from "vitest";
import { ReviewSubmitted } from "../events/review-submitted.event.js";

describe("ReviewSubmitted", () => {
  it("creates event with default occurredAt", () => {
    const before = new Date();
    const event = new ReviewSubmitted("r-1", "a-1", "res-1", "product", 5);
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("accepts explicit occurredAt", () => {
    const date = new Date("2025-01-01");
    const event = new ReviewSubmitted("r-1", "a-1", "res-1", "product", 5, date);
    expect(event.occurredAt).toBe(date);
  });

  it("stores all fields", () => {
    const event = new ReviewSubmitted("r-1", "a-1", "res-1", "product", 5);
    expect(event.reviewId).toBe("r-1");
    expect(event.authorId).toBe("a-1");
    expect(event.resourceId).toBe("res-1");
    expect(event.resourceType).toBe("product");
    expect(event.rating).toBe(5);
  });
});
