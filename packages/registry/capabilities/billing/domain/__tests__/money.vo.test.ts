import { describe, it, expect } from "vitest";
import { Money } from "../value-objects/money.vo.js";

describe("Money VO", () => {
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

  it("rejects non-integer amounts", () => {
    const result = Money.create(10.5, "USD");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("integer");
  });

  it("rejects invalid currency codes", () => {
    expect(Money.create(100, "").isFail()).toBe(true);
    expect(Money.create(100, "US").isFail()).toBe(true);
    expect(Money.create(100, "USDX").isFail()).toBe(true);
  });

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

  it("rejects negative amounts", () => {
    expect(Money.create(-100, "USD").isFail()).toBe(true);
  });

  it("rejects non-alpha currency codes", () => {
    expect(Money.create(100, "123").isFail()).toBe(true);
    expect(Money.create(100, "$$$").isFail()).toBe(true);
  });

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
    expect(a.add(b).isFail()).toBe(true);
  });

  it("subtracts same currency", () => {
    const a = Money.create(1000, "USD").unwrap();
    const b = Money.create(300, "USD").unwrap();
    const result = a.subtract(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(700);
  });

  it("fails subtracting different currencies", () => {
    const a = Money.create(1000, "USD").unwrap();
    const b = Money.create(500, "EUR").unwrap();
    expect(a.subtract(b).isFail()).toBe(true);
  });

  it("multiplies and rounds", () => {
    const money = Money.create(1000, "USD").unwrap();
    const result = money.multiply(1.5);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(1500);
  });

  it("rounds fractional results on multiply", () => {
    const money = Money.create(333, "USD").unwrap();
    const result = money.multiply(0.1);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(33);
  });

  it("rejects non-finite factor", () => {
    const money = Money.create(1000, "USD").unwrap();
    expect(money.multiply(Infinity).isFail()).toBe(true);
  });

  it("checks positive and zero", () => {
    expect(Money.create(100, "USD").unwrap().isPositive()).toBe(true);
    expect(Money.create(0, "USD").unwrap().isPositive()).toBe(false);
    expect(Money.create(0, "USD").unwrap().isZero()).toBe(true);
  });

  it("checks equality", () => {
    const a = Money.create(1000, "USD").unwrap();
    const b = Money.create(1000, "USD").unwrap();
    const c = Money.create(500, "USD").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
