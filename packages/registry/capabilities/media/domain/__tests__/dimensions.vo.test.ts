import { describe, it, expect } from "vitest";
import { Dimensions } from "../value-objects/dimensions.vo.js";

describe("Dimensions VO", () => {
  it("creates valid dimensions", () => {
    const result = Dimensions.create(1920, 1080);
    expect(result.isOk()).toBe(true);
    const dims = result.unwrap();
    expect(dims.width).toBe(1920);
    expect(dims.height).toBe(1080);
  });

  it("computes aspect ratio", () => {
    const dims = Dimensions.create(1920, 1080).unwrap();
    expect(dims.aspectRatio).toBeCloseTo(16 / 9);
  });

  it("rejects zero width", () => {
    const result = Dimensions.create(0, 100);
    expect(result.isFail()).toBe(true);
  });

  it("rejects negative height", () => {
    const result = Dimensions.create(100, -1);
    expect(result.isFail()).toBe(true);
  });

  it("rejects non-integer width", () => {
    const result = Dimensions.create(1.5, 100);
    expect(result.isFail()).toBe(true);
  });

  it("rejects non-integer height", () => {
    const result = Dimensions.create(100, 2.7);
    expect(result.isFail()).toBe(true);
  });

  it("compares equality", () => {
    const a = Dimensions.create(800, 600).unwrap();
    const b = Dimensions.create(800, 600).unwrap();
    const c = Dimensions.create(1024, 768).unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
