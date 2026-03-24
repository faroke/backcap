import { describe, it, expect } from "vitest";
import { PromotionNotFound } from "../errors/promotion-not-found.error.js";
import { CouponNotFound } from "../errors/coupon-not-found.error.js";
import { CouponExpired } from "../errors/coupon-expired.error.js";
import { CouponUsageExceeded } from "../errors/coupon-usage-exceeded.error.js";
import { InvalidDiscountRule } from "../errors/invalid-discount-rule.error.js";
import { PromotionInactive } from "../errors/promotion-inactive.error.js";
import { EligibilityNotMet } from "../errors/eligibility-not-met.error.js";

describe("Discounts domain errors", () => {
  it("creates PromotionNotFound", () => {
    const error = PromotionNotFound.create("promo-1");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PromotionNotFound");
    expect(error.message).toContain("promo-1");
  });

  it("creates CouponNotFound", () => {
    const error = CouponNotFound.create("SAVE10");
    expect(error.name).toBe("CouponNotFound");
    expect(error.message).toContain("SAVE10");
  });

  it("creates CouponExpired", () => {
    const error = CouponExpired.create("SAVE10");
    expect(error.name).toBe("CouponExpired");
    expect(error.message).toContain("SAVE10");
  });

  it("creates CouponUsageExceeded", () => {
    const error = CouponUsageExceeded.create("SAVE10");
    expect(error.name).toBe("CouponUsageExceeded");
    expect(error.message).toContain("SAVE10");
  });

  it("creates InvalidDiscountRule", () => {
    const error = InvalidDiscountRule.create("missing percentage");
    expect(error.name).toBe("InvalidDiscountRule");
    expect(error.message).toContain("missing percentage");
  });

  it("creates PromotionInactive", () => {
    const error = PromotionInactive.create("promo-1");
    expect(error.name).toBe("PromotionInactive");
    expect(error.message).toContain("promo-1");
  });

  it("creates EligibilityNotMet", () => {
    const error = EligibilityNotMet.create("promo-1");
    expect(error.name).toBe("EligibilityNotMet");
    expect(error.message).toContain("promo-1");
  });
});
