import { describe, it, expect, beforeEach } from "vitest";
import { ValidateCoupon } from "../use-cases/validate-coupon.use-case.js";
import { InMemoryCouponRepository } from "./mocks/coupon-repository.mock.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { createTestCoupon } from "./fixtures/coupon.fixture.js";
import { CouponNotFound } from "../../domain/errors/coupon-not-found.error.js";

describe("ValidateCoupon use case", () => {
  let couponRepo: InMemoryCouponRepository;
  let promoRepo: InMemoryPromotionRepository;
  let useCase: ValidateCoupon;

  beforeEach(() => {
    couponRepo = new InMemoryCouponRepository();
    promoRepo = new InMemoryPromotionRepository();
    useCase = new ValidateCoupon(couponRepo, promoRepo);
  });

  it("validates a valid coupon", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute("SAVE10");
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.valid).toBe(true);
    expect(output.promotionId).toBe(promo.id);
    expect(output.promotionName).toBe(promo.name);
  });

  it("returns invalid for expired coupon", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);

    const past = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 1000);
    const coupon = createTestCoupon({ promotionId: promo.id, startDate: past, endDate: pastEnd });
    await couponRepo.save(coupon);

    const result = await useCase.execute("SAVE10");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().valid).toBe(false);
  });

  it("returns invalid for inactive promotion", async () => {
    const promo = createTestPromotion({ status: "draft" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute("SAVE10");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().valid).toBe(false);
  });

  it("fails if coupon not found", async () => {
    const result = await useCase.execute("NONEXISTENT");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CouponNotFound);
  });
});
