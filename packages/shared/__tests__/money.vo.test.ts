import { describe, it, expect } from "vitest";
import { Money } from "../src/money.vo.js";
import { MoneyError } from "../src/errors/money.error.js";

describe("Money VO", () => {
  describe("create", () => {
    it("creates money with integer cents", () => {
      const result = Money.create(1000, "USD");
      expect(result.isOk()).toBe(true);
      const money = result.unwrap();
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe("USD");
    });

    it("uppercases currency code", () => {
      const money = Money.create(500, "eur").unwrap();
      expect(money.currency).toBe("EUR");
    });

    it("allows zero amount", () => {
      const result = Money.create(0, "USD");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(0);
    });

    it("rejects non-integer amounts", () => {
      const result = Money.create(10.5, "USD");
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
      expect(result.unwrapError().message).toContain("integer");
    });

    it("rejects negative amounts", () => {
      const result = Money.create(-100, "USD");
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
    });

    it("rejects empty currency code", () => {
      expect(Money.create(100, "").isFail()).toBe(true);
    });

    it("rejects 2-letter currency code", () => {
      expect(Money.create(100, "US").isFail()).toBe(true);
    });

    it("rejects 4-letter currency code", () => {
      expect(Money.create(100, "USDX").isFail()).toBe(true);
    });

    it("rejects non-alpha currency codes", () => {
      expect(Money.create(100, "123").isFail()).toBe(true);
      expect(Money.create(100, "$$$").isFail()).toBe(true);
    });
  });

  describe("zero", () => {
    it("creates zero money", () => {
      const result = Money.zero("USD");
      expect(result.isOk()).toBe(true);
      const money = result.unwrap();
      expect(money.amount).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it("rejects zero with invalid currency", () => {
      expect(Money.zero("").isFail()).toBe(true);
      expect(Money.zero("X").isFail()).toBe(true);
    });
  });

  describe("add", () => {
    it("adds same currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      const result = a.add(b);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(1500);
    });

    it("fails adding different currencies", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "EUR").unwrap();
      const result = a.add(b);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
    });
  });

  describe("subtract", () => {
    it("subtracts same currency", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(300, "USD").unwrap();
      const result = a.subtract(b);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(700);
    });

    it("rejects negative result", () => {
      const a = Money.create(100, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      const result = a.subtract(b);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
    });

    it("fails subtracting different currencies", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(500, "EUR").unwrap();
      const result = a.subtract(b);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
    });

    it("allows subtraction to zero", () => {
      const a = Money.create(500, "USD").unwrap();
      const b = Money.create(500, "USD").unwrap();
      const result = a.subtract(b);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().isZero()).toBe(true);
    });
  });

  describe("multiply", () => {
    it("multiplies by integer factor", () => {
      const money = Money.create(1000, "USD").unwrap();
      const result = money.multiply(3);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(3000);
    });

    it("multiplies and rounds", () => {
      const money = Money.create(1000, "USD").unwrap();
      const result = money.multiply(1.5);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(1500);
    });

    it("rounds fractional results", () => {
      const money = Money.create(333, "USD").unwrap();
      const result = money.multiply(0.1);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(33);
    });

    it("rejects non-finite factor", () => {
      const money = Money.create(1000, "USD").unwrap();
      expect(money.multiply(Infinity).isFail()).toBe(true);
    });

    it("rejects negative factor", () => {
      const money = Money.create(1000, "USD").unwrap();
      const result = money.multiply(-2);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(MoneyError);
    });

    it("allows multiply by zero", () => {
      const money = Money.create(1000, "USD").unwrap();
      const result = money.multiply(0);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(0);
    });
  });

  describe("comparisons", () => {
    it("checks positive", () => {
      expect(Money.create(100, "USD").unwrap().isPositive()).toBe(true);
      expect(Money.create(0, "USD").unwrap().isPositive()).toBe(false);
    });

    it("checks zero", () => {
      expect(Money.create(0, "USD").unwrap().isZero()).toBe(true);
      expect(Money.create(100, "USD").unwrap().isZero()).toBe(false);
    });

    it("checks equality", () => {
      const a = Money.create(1000, "USD").unwrap();
      const b = Money.create(1000, "USD").unwrap();
      const c = Money.create(500, "USD").unwrap();
      const d = Money.create(1000, "EUR").unwrap();
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
      expect(a.equals(d)).toBe(false);
    });
  });
});
