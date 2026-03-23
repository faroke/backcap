import { describe, it, expect } from "vitest";
import { Money } from "../value-objects/money.vo.js";
import { InvalidPrice } from "../errors/invalid-price.error.js";

describe("Money VO", () => {
  it("creates with valid cents and currency", () => {
    const result = Money.create(1000, "USD");
    expect(result.isOk()).toBe(true);
    const money = result.unwrap();
    expect(money.cents).toBe(1000);
    expect(money.currency).toBe("USD");
  });

  it("defaults to USD", () => {
    const result = Money.create(500);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().currency).toBe("USD");
  });

  it("normalizes currency to uppercase", () => {
    const result = Money.create(100, "eur");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().currency).toBe("EUR");
  });

  it("allows zero cents", () => {
    const result = Money.create(0);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().cents).toBe(0);
  });

  it("rejects non-integer cents", () => {
    const result = Money.create(10.5);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPrice);
    expect(result.unwrapError().message).toContain("integer");
  });

  it("rejects negative cents", () => {
    const result = Money.create(-100);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPrice);
  });

  it("rejects invalid currency code", () => {
    const result = Money.create(100, "ABCD");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPrice);
  });

  describe("add", () => {
    it("adds same currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      const result = a.add(b);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().cents).toBe(1500);
    });

    it("rejects different currencies", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "EUR").unwrap();
      const result = a.add(b);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("subtract", () => {
    it("subtracts same currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(300, "USD").unwrap();
      const result = a.subtract(b);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().cents).toBe(700);
    });

    it("rejects negative result", () => {
      const a = Money.create(100, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      const result = a.subtract(b);
      expect(result.isFail()).toBe(true);
    });

    it("rejects different currencies", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "EUR").unwrap();
      const result = a.subtract(b);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("multiply", () => {
    it("multiplies by integer factor", () => {
      const a = Money.create(1000, "USD").unwrap();
      const result = a.multiply(3);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().cents).toBe(3000);
    });

    it("rounds to nearest cent", () => {
      const a = Money.create(100, "USD").unwrap();
      const result = a.multiply(1.5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().cents).toBe(150);
    });

    it("rejects negative factor", () => {
      const a = Money.create(1000, "USD").unwrap();
      const result = a.multiply(-2);
      expect(result.isFail()).toBe(true);
    });
  });

  describe("equals", () => {
    it("returns true for same cents and currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(1000, "USD").unwrap();
      expect(a.equals(b)).toBe(true);
    });

    it("returns false for different cents", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      expect(a.equals(b)).toBe(false);
    });

    it("returns false for different currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(1000, "EUR").unwrap();
      expect(a.equals(b)).toBe(false);
    });
  });
});
