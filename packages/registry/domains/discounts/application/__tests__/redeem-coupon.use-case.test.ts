import { describe, it, expect, beforeEach } from "vitest";
import { RedeemCoupon } from "../use-cases/redeem-coupon.use-case.js";
import { InMemoryCouponRepository } from "./mocks/coupon-repository.mock.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { createTestCoupon } from "./fixtures/coupon.fixture.js";
import { CouponNotFound } from "../../domain/errors/coupon-not-found.error.js";
import { PromotionInactive } from "../../domain/errors/promotion-inactive.error.js";
import { EligibilityNotMet } from "../../domain/errors/eligibility-not-met.error.js";
import { CouponExpired } from "../../domain/errors/coupon-expired.error.js";
import { CouponUsageExceeded } from "../../domain/errors/coupon-usage-exceeded.error.js";
import { EligibilityCondition } from "../../domain/entities/eligibility-condition.entity.js";

describe("RedeemCoupon use case", () => {
  let couponRepo: InMemoryCouponRepository;
  let promoRepo: InMemoryPromotionRepository;
  let useCase: RedeemCoupon;

  const input = {
    code: "SAVE10",
    customerId: "cust-1",
    orderTotalCents: 10000,
    orderCurrency: "USD",
    productIds: ["prod-1"],
    totalItemQuantity: 3,
  };

  beforeEach(() => {
    couponRepo = new InMemoryCouponRepository();
    promoRepo = new InMemoryPromotionRepository();
    useCase = new RedeemCoupon(couponRepo, promoRepo);
  });

  it("redeems coupon successfully", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.discountCents).toBe(1000);
    expect(output.currency).toBe("USD");
    expect(output.event.couponId).toBe(coupon.id);
  });

  it("fails if coupon not found", async () => {
    const result = await useCase.execute(input);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CouponNotFound);
  });

  it("fails if promotion inactive", async () => {
    const promo = createTestPromotion({ status: "draft" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute(input);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PromotionInactive);
  });

  it("fails if eligibility not met", async () => {
    const condition = EligibilityCondition.create({
      id: "cond-1",
      type: "min_order_amount",
      minOrderAmountCents: 50000,
      minOrderAmountCurrency: "USD",
    }).unwrap();

    const promo = createTestPromotion({ status: "active", conditions: [condition] });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute({ ...input, orderTotalCents: 3000 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(EligibilityNotMet);
  });

  it("fails if coupon expired", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);

    const past = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(Date.now() - 1000);
    const coupon = createTestCoupon({ promotionId: promo.id, startDate: past, endDate: pastEnd });
    await couponRepo.save(coupon);

    const result = await useCase.execute(input);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CouponExpired);
  });

  it("fails if coupon usage exceeded (global)", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id, maxUsesTotal: 1, currentUses: 1 });
    await couponRepo.save(coupon);

    const result = await useCase.execute(input);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CouponUsageExceeded);
  });

  it("fails if customer limit exceeded", async () => {
    const promo = createTestPromotion({ status: "active" });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id, maxUsesPerCustomer: 1 });
    await couponRepo.save(coupon);
    await couponRepo.recordUsage(coupon.id, "cust-1");

    const result = await useCase.execute(input);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CouponUsageExceeded);
  });
});
