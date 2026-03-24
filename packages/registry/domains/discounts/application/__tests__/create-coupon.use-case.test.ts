import { describe, it, expect, beforeEach } from "vitest";
import { CreateCoupon } from "../use-cases/create-coupon.use-case.js";
import { InMemoryCouponRepository } from "./mocks/coupon-repository.mock.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { PromotionNotFound } from "../../domain/errors/promotion-not-found.error.js";

describe("CreateCoupon use case", () => {
  let couponRepo: InMemoryCouponRepository;
  let promoRepo: InMemoryPromotionRepository;
  let useCase: CreateCoupon;

  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    couponRepo = new InMemoryCouponRepository();
    promoRepo = new InMemoryPromotionRepository();
    useCase = new CreateCoupon(couponRepo, promoRepo);
  });

  it("creates a coupon linked to existing promotion", async () => {
    const promo = createTestPromotion();
    await promoRepo.save(promo);

    const result = await useCase.execute({
      id: "coupon-1",
      code: "SAVE20",
      promotionId: promo.id,
      maxUsesTotal: 100,
      maxUsesPerCustomer: 1,
      startDate: now,
      endDate: future,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.couponId).toBe("coupon-1");
    expect(output.event.code).toBe("SAVE20");
  });

  it("fails if promotion not found", async () => {
    const result = await useCase.execute({
      id: "coupon-1",
      code: "SAVE20",
      promotionId: "nonexistent",
      startDate: now,
      endDate: future,
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PromotionNotFound);
  });
});
