import { describe, it, expect } from "vitest";
import { Money } from "../value-objects/money.vo.js";

describe("Money VO (discounts)", () => {
  it("creates valid money", () => {
    const result = Money.create(1000, "USD");
    expect(result.isOk()).toBe(true);
    const money = result.unwrap();
    expect(money.amount).toBe(1000);
    expect(money.currency).toBe("USD");
  });

  it("uppercases currency", () => {
    expect(Money.create(100, "usd").unwrap().currency).toBe("USD");
  });

  it("rejects non-integer amount", () => {
    expect(Money.create(10.5, "USD").isFail()).toBe(true);
  });

  it("rejects negative amount", () => {
    expect(Money.create(-1, "USD").isFail()).toBe(true);
  });

  it("rejects invalid currency", () => {
    expect(Money.create(100, "XX").isFail()).toBe(true);
  });

  it("creates zero", () => {
    const result = Money.zero("USD");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(0);
  });

  it("adds money", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(200, "USD").unwrap();
    const result = a.add(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(300);
  });

  it("fails to add different currencies", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(200, "EUR").unwrap();
    expect(a.add(b).isFail()).toBe(true);
  });

  it("subtracts money (allows negative)", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(200, "USD").unwrap();
    const result = a.subtract(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(-100);
  });

  it("multiplies money", () => {
    const m = Money.create(100, "USD").unwrap();
    const result = m.multiply(2.5);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(250);
  });

  it("multiplies by negative factor", () => {
    const m = Money.create(100, "USD").unwrap();
    const result = m.multiply(-1);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(-100);
  });

  it("rejects non-finite factor", () => {
    const m = Money.create(100, "USD").unwrap();
    expect(m.multiply(Infinity).isFail()).toBe(true);
  });

  it("checks isZero, isPositive, isNegative", () => {
    expect(Money.create(0, "USD").unwrap().isZero()).toBe(true);
    expect(Money.create(100, "USD").unwrap().isPositive()).toBe(true);
    expect(Money.create(0, "USD").unwrap().isNegative()).toBe(false);
  });

  it("checks equality", () => {
    const a = Money.create(100, "USD").unwrap();
    const b = Money.create(100, "USD").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(Money.create(200, "USD").unwrap())).toBe(false);
  });
});
