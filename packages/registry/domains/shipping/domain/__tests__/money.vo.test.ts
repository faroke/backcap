import { describe, it, expect } from "vitest";
import { Money } from "../value-objects/money.vo.js";

describe("Money", () => {
  it("creates with valid amount and currency", () => {
    const result = Money.create(1000, "USD");
    expect(result.isOk()).toBe(true);
    const money = result.unwrap();
    expect(money.amount).toBe(1000);
    expect(money.currency).toBe("USD");
  });

  it("uppercases currency", () => {
    const money = Money.create(100, "eur").unwrap();
    expect(money.currency).toBe("EUR");
  });

  it("rejects non-integer amount", () => {
    const result = Money.create(10.5, "USD");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("MoneyError");
  });

  it("rejects negative amount", () => {
    const result = Money.create(-1, "USD");
    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid currency code", () => {
    const result = Money.create(100, "ABCD");
    expect(result.isFail()).toBe(true);
  });

  it("zero() creates zero amount", () => {
    const money = Money.zero("USD").unwrap();
    expect(money.amount).toBe(0);
    expect(money.isZero()).toBe(true);
  });

  it("add() sums same currency", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(200, "USD").unwrap();
    const result = a.add(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(300);
  });

  it("add() rejects currency mismatch", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(100, "EUR").unwrap();
    const result = a.add(b);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("MoneyError");
  });

  it("subtract() computes difference", () => {
    const a = Money.create(300, "USD").unwrap();
    const b = Money.create(100, "USD").unwrap();
    const result = a.subtract(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(200);
  });

  it("subtract() rejects negative result", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(200, "USD").unwrap();
    const result = a.subtract(b);
    expect(result.isFail()).toBe(true);
  });

  it("multiply() scales amount", () => {
    const money = Money.create(100, "USD").unwrap();
    const result = money.multiply(2.5);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(250);
  });

  it("multiply() rejects non-finite factor", () => {
    const money = Money.create(100, "USD").unwrap();
    const result = money.multiply(Infinity);
    expect(result.isFail()).toBe(true);
  });

  it("multiply() rejects negative factor", () => {
    const money = Money.create(100, "USD").unwrap();
    const result = money.multiply(-1);
    expect(result.isFail()).toBe(true);
  });

  it("isZero(), isPositive(), isNegative()", () => {
    const zero = Money.create(0, "USD").unwrap();
    const positive = Money.create(100, "USD").unwrap();
    expect(zero.isZero()).toBe(true);
    expect(zero.isPositive()).toBe(false);
    expect(positive.isPositive()).toBe(true);
    expect(positive.isNegative()).toBe(false);
  });

  it("equals() works correctly", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(100, "USD").unwrap();
    const c = Money.create(200, "USD").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
