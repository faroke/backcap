import { describe, it, expect } from "vitest";
import { Rating } from "../value-objects/rating.vo.js";
import { InvalidRating } from "../errors/invalid-rating.error.js";

describe("Rating", () => {
  it.each([1, 2, 3, 4, 5])("creates valid rating for value %d", (value) => {
    const result = Rating.create(value);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(value);
  });

  it("rejects 0 (below range)", () => {
    const result = Rating.create(0);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("rejects 6 (above range)", () => {
    const result = Rating.create(6);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("rejects non-integer (3.5)", () => {
    const result = Rating.create(3.5);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("rejects negative values", () => {
    const result = Rating.create(-1);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("rejects NaN", () => {
    const result = Rating.create(NaN);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });

  it("rejects Infinity", () => {
    const result = Rating.create(Infinity);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidRating);
  });
});
