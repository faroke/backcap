import { describe, it, expect } from "vitest";
import { Quantity } from "../value-objects/quantity.vo.js";

describe("Quantity VO", () => {
  it("creates valid quantity with value 0", () => {
    const result = Quantity.create(0);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(0);
  });

  it("creates valid quantity with positive value", () => {
    const result = Quantity.create(100);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(100);
  });

  it("rejects negative values", () => {
    const result = Quantity.create(-1);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidStockQuantity");
  });

  it("rejects non-integer values", () => {
    const result = Quantity.create(1.5);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidStockQuantity");
  });

  it("zero() factory returns quantity with value 0", () => {
    const qty = Quantity.zero();
    expect(qty.value).toBe(0);
  });

  it("unsafeFrom() creates quantity without validation", () => {
    const qty = Quantity.unsafeFrom(42);
    expect(qty.value).toBe(42);
  });

  it("add() returns correct sum", () => {
    const a = Quantity.create(10).unwrap();
    const b = Quantity.create(5).unwrap();
    const sum = a.add(b);
    expect(sum.value).toBe(15);
  });

  it("subtract() returns correct difference", () => {
    const a = Quantity.create(10).unwrap();
    const b = Quantity.create(3).unwrap();
    const result = a.subtract(b);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe(7);
  });

  it("subtract() fails when result would be negative", () => {
    const a = Quantity.create(3).unwrap();
    const b = Quantity.create(10).unwrap();
    const result = a.subtract(b);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("InvalidStockQuantity");
  });

  it("isZero() returns true for 0", () => {
    expect(Quantity.zero().isZero()).toBe(true);
  });

  it("isZero() returns false for non-zero", () => {
    expect(Quantity.create(1).unwrap().isZero()).toBe(false);
  });

  it("isAtOrBelow() threshold check", () => {
    const qty = Quantity.create(5).unwrap();
    expect(qty.isAtOrBelow(5)).toBe(true);
    expect(qty.isAtOrBelow(10)).toBe(true);
    expect(qty.isAtOrBelow(4)).toBe(false);
  });

  it("equals() comparison", () => {
    const a = Quantity.create(10).unwrap();
    const b = Quantity.create(10).unwrap();
    const c = Quantity.create(5).unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
