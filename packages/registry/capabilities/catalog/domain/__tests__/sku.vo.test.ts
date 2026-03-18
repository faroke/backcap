import { describe, it, expect } from "vitest";
import { SKU } from "../value-objects/sku.vo.js";

describe("SKU VO", () => {
  it("creates a valid SKU", () => {
    const result = SKU.create("SKU-001");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("SKU-001");
  });

  it("normalizes to uppercase", () => {
    const result = SKU.create("sku-001");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("SKU-001");
  });

  it("accepts alphanumeric without hyphens", () => {
    const result = SKU.create("ABC123");
    expect(result.isOk()).toBe(true);
  });

  it("accepts long SKU up to 50 chars", () => {
    const sku = "A" + "B".repeat(48) + "C";
    const result = SKU.create(sku);
    expect(result.isOk()).toBe(true);
  });

  it("rejects SKU shorter than 3 chars", () => {
    const result = SKU.create("AB");
    expect(result.isFail()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = SKU.create("");
    expect(result.isFail()).toBe(true);
  });

  it("rejects SKU starting with hyphen", () => {
    const result = SKU.create("-SKU001");
    expect(result.isFail()).toBe(true);
  });

  it("rejects SKU ending with hyphen", () => {
    const result = SKU.create("SKU001-");
    expect(result.isFail()).toBe(true);
  });

  describe("equals", () => {
    it("returns true for same value", () => {
      const a = SKU.create("SKU-001").unwrap();
      const b = SKU.create("SKU-001").unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different value", () => {
      const a = SKU.create("SKU-001").unwrap();
      const b = SKU.create("SKU-002").unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });
});
