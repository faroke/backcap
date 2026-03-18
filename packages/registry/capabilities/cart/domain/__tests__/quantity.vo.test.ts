import { describe, it, expect } from "vitest";
import { Quantity } from "../value-objects/quantity.vo.js";

describe("Quantity value object", () => {
  it("creates a valid quantity", () => {
    const result = Quantity.create(5);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(5);
  });

  it("rejects zero", () => {
    const result = Quantity.create(0);
    expect(result.isFail()).toBe(true);
  });

  it("rejects negative", () => {
    const result = Quantity.create(-1);
    expect(result.isFail()).toBe(true);
  });

  it("rejects non-integer", () => {
    const result = Quantity.create(1.5);
    expect(result.isFail()).toBe(true);
  });

  it("rejects exceeding max", () => {
    const result = Quantity.create(100);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("99");
  });

  it("respects custom max", () => {
    const result = Quantity.create(5, 3);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("3");
  });

  it("allows max value", () => {
    const result = Quantity.create(99);
    expect(result.isOk()).toBe(true);
  });

  describe("add", () => {
    it("adds amount to quantity", () => {
      const qty = Quantity.create(5).unwrap();
      const result = qty.add(3);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().value).toBe(8);
    });

    it("fails if sum exceeds max", () => {
      const qty = Quantity.create(95).unwrap();
      const result = qty.add(10);
      expect(result.isFail()).toBe(true);
    });

    it("rejects negative amount", () => {
      const qty = Quantity.create(5).unwrap();
      const result = qty.add(-3);
      expect(result.isFail()).toBe(true);
    });

    it("rejects non-integer amount", () => {
      const qty = Quantity.create(5).unwrap();
      const result = qty.add(1.5);
      expect(result.isFail()).toBe(true);
    });

    it("rejects zero amount", () => {
      const qty = Quantity.create(5).unwrap();
      const result = qty.add(0);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("equals", () => {
    it("returns true for same value", () => {
      const a = Quantity.create(5).unwrap();
      const b = Quantity.create(5).unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different value", () => {
      const a = Quantity.create(5).unwrap();
      const b = Quantity.create(3).unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });
});
