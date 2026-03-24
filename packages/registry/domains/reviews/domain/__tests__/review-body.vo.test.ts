import { describe, it, expect } from "vitest";
import { ReviewBody } from "../value-objects/review-body.vo.js";

describe("ReviewBody", () => {
  it("creates valid body", () => {
    const result = ReviewBody.create("Great product!");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Great product!");
  });

  it("trims whitespace", () => {
    const result = ReviewBody.create("  Trimmed body  ");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("Trimmed body");
  });

  it("rejects empty string", () => {
    const result = ReviewBody.create("");
    expect(result.isFail()).toBe(true);
  });

  it("rejects whitespace-only string", () => {
    const result = ReviewBody.create("   ");
    expect(result.isFail()).toBe(true);
  });

  it("rejects body longer than 5000 characters", () => {
    const result = ReviewBody.create("a".repeat(5001));
    expect(result.isFail()).toBe(true);
  });

  it("accepts body at exactly 5000 characters", () => {
    const result = ReviewBody.create("a".repeat(5000));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value.length).toBe(5000);
  });
});
