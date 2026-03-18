import { describe, it, expect } from "vitest";
import { CartStatus } from "../value-objects/cart-status.vo.js";

describe("CartStatus value object", () => {
  it("creates active status", () => {
    const status = CartStatus.active();
    expect(status.value).toBe("active");
    expect(status.isActive()).toBe(true);
    expect(status.isAbandoned()).toBe(false);
    expect(status.isConverted()).toBe(false);
  });

  it("creates abandoned status", () => {
    const status = CartStatus.abandoned();
    expect(status.value).toBe("abandoned");
    expect(status.isAbandoned()).toBe(true);
  });

  it("creates converted status", () => {
    const status = CartStatus.converted();
    expect(status.value).toBe("converted");
    expect(status.isConverted()).toBe(true);
  });

  describe("from", () => {
    it("creates from valid string", () => {
      const result = CartStatus.from("active");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().isActive()).toBe(true);
    });

    it("rejects invalid string", () => {
      const result = CartStatus.from("invalid");
      expect(result.isFail()).toBe(true);
    });
  });

  describe("equals", () => {
    it("returns true for same value", () => {
      expect(CartStatus.active().equals(CartStatus.active())).toBe(true);
    });

    it("returns false for different value", () => {
      expect(CartStatus.active().equals(CartStatus.abandoned())).toBe(false);
    });
  });
});
