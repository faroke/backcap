import { describe, it, expect } from "vitest";
import { CouponCode } from "../entities/coupon-code.entity.js";

const now = new Date();
const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

const validParams = {
  id: "coupon-1",
  code: "SAVE10",
  promotionId: "promo-1",
  maxUsesTotal: 100,
  maxUsesPerCustomer: 1,
  startDate: now,
  endDate: future,
};

describe("CouponCode entity", () => {
  it("creates a valid coupon", () => {
    const result = CouponCode.create(validParams);
    expect(result.isOk()).toBe(true);
    const coupon = result.unwrap();
    expect(coupon.code).toBe("SAVE10");
    expect(coupon.promotionId).toBe("promo-1");
  });

  it("uppercases and trims code", () => {
    const result = CouponCode.create({ ...validParams, code: " save10 " });
    expect(result.unwrap().code).toBe("SAVE10");
  });

  it("rejects empty id", () => {
    expect(CouponCode.create({ ...validParams, id: "" }).isFail()).toBe(true);
  });

  it("rejects empty code", () => {
    expect(CouponCode.create({ ...validParams, code: "" }).isFail()).toBe(true);
  });

  it("rejects empty promotionId", () => {
    expect(CouponCode.create({ ...validParams, promotionId: "" }).isFail()).toBe(true);
  });

  it("rejects invalid validity period", () => {
    expect(CouponCode.create({ ...validParams, startDate: future, endDate: now }).isFail()).toBe(true);
  });

  it("isValid returns true for active non-exhausted coupon", () => {
    const coupon = CouponCode.create(validParams).unwrap();
    expect(coupon.isValid(new Date(now.getTime() + 1000))).toBe(true);
  });

  it("isValid returns false when exhausted", () => {
    const coupon = CouponCode.create({ ...validParams, maxUsesTotal: 1, currentUses: 1 }).unwrap();
    expect(coupon.isValid(new Date(now.getTime() + 1000))).toBe(false);
  });

  it("redeems successfully", () => {
    const coupon = CouponCode.create(validParams).unwrap();
    const result = coupon.redeem(0);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().usageLimit.currentUses).toBe(1);
  });

  it("fails to redeem expired coupon", () => {
    const coupon = CouponCode.create({ ...validParams, startDate: past, endDate: new Date(now.getTime() - 1000) }).unwrap();
    const result = coupon.redeem(0);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CouponExpired");
  });

  it("fails to redeem exhausted coupon", () => {
    const coupon = CouponCode.create({ ...validParams, maxUsesTotal: 1, currentUses: 1 }).unwrap();
    const result = coupon.redeem(0);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CouponUsageExceeded");
  });

  it("fails to redeem when customer limit exceeded", () => {
    const coupon = CouponCode.create(validParams).unwrap();
    const result = coupon.redeem(1);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe("CouponUsageExceeded");
  });
});
