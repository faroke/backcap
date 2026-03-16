import { describe, it, expect } from "vitest";
import { Result } from "../src/result.js";

describe("Result", () => {
  describe("ok", () => {
    it("creates an ok result", () => {
      const result = Result.ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isFail()).toBe(false);
    });

    it("unwraps the value", () => {
      const result = Result.ok("hello");
      expect(result.unwrap()).toBe("hello");
    });

    it("throws on unwrapError", () => {
      const result = Result.ok(42);
      expect(() => result.unwrapError()).toThrow("Cannot unwrapError on an ok Result");
    });

    it("maps the value", () => {
      const result = Result.ok(5).map((v) => v * 2);
      expect(result.unwrap()).toBe(10);
    });
  });

  describe("fail", () => {
    it("creates a fail result", () => {
      const result = Result.fail(new Error("oops"));
      expect(result.isOk()).toBe(false);
      expect(result.isFail()).toBe(true);
    });

    it("unwraps the error", () => {
      const error = new Error("oops");
      const result = Result.fail(error);
      expect(result.unwrapError()).toBe(error);
    });

    it("throws on unwrap", () => {
      const result = Result.fail(new Error("oops"));
      expect(() => result.unwrap()).toThrow("oops");
    });

    it("does not map on fail", () => {
      const result = Result.fail(new Error("oops")).map((v: number) => v * 2);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().message).toBe("oops");
    });
  });

  describe("edge cases", () => {
    it("handles ok with undefined value", () => {
      const result = Result.ok(undefined);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBeUndefined();
    });

    it("handles ok with null value", () => {
      const result = Result.ok(null);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBeNull();
    });

    it("chains multiple maps", () => {
      const result = Result.ok(2)
        .map((v) => v + 3)
        .map((v) => v * 10);
      expect(result.unwrap()).toBe(50);
    });
  });
});
