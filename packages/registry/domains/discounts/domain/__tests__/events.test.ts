import { describe, it, expect } from "vitest";
import { PromotionCreated } from "../events/promotion-created.event.js";
import { PromotionActivated } from "../events/promotion-activated.event.js";
import { PromotionDeactivated } from "../events/promotion-deactivated.event.js";
import { CouponRedeemed } from "../events/coupon-redeemed.event.js";
import { CouponCreated } from "../events/coupon-created.event.js";

describe("Discounts domain events", () => {
  it("creates PromotionCreated event", () => {
    const event = new PromotionCreated("promo-1", "Summer Sale");
    expect(event.promotionId).toBe("promo-1");
    expect(event.name).toBe("Summer Sale");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates PromotionActivated event", () => {
    const event = new PromotionActivated("promo-1");
    expect(event.promotionId).toBe("promo-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates PromotionDeactivated event", () => {
    const event = new PromotionDeactivated("promo-1");
    expect(event.promotionId).toBe("promo-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates CouponRedeemed event", () => {
    const event = new CouponRedeemed("coupon-1", "SAVE10", "promo-1", "cust-1", 1000, "USD");
    expect(event.couponId).toBe("coupon-1");
    expect(event.code).toBe("SAVE10");
    expect(event.promotionId).toBe("promo-1");
    expect(event.customerId).toBe("cust-1");
    expect(event.discountAmountCents).toBe(1000);
    expect(event.currency).toBe("USD");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates CouponCreated event", () => {
    const event = new CouponCreated("coupon-1", "SAVE10", "promo-1");
    expect(event.couponId).toBe("coupon-1");
    expect(event.code).toBe("SAVE10");
    expect(event.promotionId).toBe("promo-1");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});
