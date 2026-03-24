import { describe, it, expect, beforeEach } from "vitest";
import { ApplyDiscount } from "../use-cases/apply-discount.use-case.js";
import { InMemoryPromotionRepository } from "./mocks/promotion-repository.mock.js";
import { InMemoryCouponRepository } from "./mocks/coupon-repository.mock.js";
import { createTestPromotion } from "./fixtures/promotion.fixture.js";
import { createTestCoupon } from "./fixtures/coupon.fixture.js";
import { DiscountRule } from "../../domain/entities/discount-rule.entity.js";
import { EligibilityCondition } from "../../domain/entities/eligibility-condition.entity.js";

describe("ApplyDiscount use case", () => {
  let promoRepo: InMemoryPromotionRepository;
  let couponRepo: InMemoryCouponRepository;
  let useCase: ApplyDiscount;

  const baseInput = {
    orderTotalCents: 10000,
    orderCurrency: "USD",
    productIds: ["prod-1"],
    customerId: "cust-1",
    totalItemQuantity: 3,
  };

  beforeEach(() => {
    promoRepo = new InMemoryPromotionRepository();
    couponRepo = new InMemoryCouponRepository();
    useCase = new ApplyDiscount(promoRepo, couponRepo);
  });

  it("returns zero when no active promotions", async () => {
    const result = await useCase.execute(baseInput);
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalDiscountCents).toBe(0);
    expect(output.breakdown).toHaveLength(0);
  });

  it("picks highest-priority non-stackable promotion", async () => {
    const p1Rule = DiscountRule.create({ id: "r1", type: "percentage", percentageValue: 10 }).unwrap();
    const p2Rule = DiscountRule.create({ id: "r2", type: "fixed_amount", fixedAmountValue: 500, fixedAmountCurrency: "USD" }).unwrap();

    const p1 = createTestPromotion({ id: "P1", status: "active", rules: [p1Rule], priority: 1, stackable: false });
    const p2 = createTestPromotion({ id: "P2", status: "active", rules: [p2Rule], priority: 0, stackable: false });
    await promoRepo.save(p1);
    await promoRepo.save(p2);

    const result = await useCase.execute(baseInput);
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalDiscountCents).toBe(1000);
    expect(output.appliedPromotionIds).toEqual(["P1"]);
  });

  it("sums stackable promotions", async () => {
    const p1Rule = DiscountRule.create({ id: "r1", type: "percentage", percentageValue: 10 }).unwrap();
    const p2Rule = DiscountRule.create({ id: "r2", type: "fixed_amount", fixedAmountValue: 500, fixedAmountCurrency: "USD" }).unwrap();

    const p1 = createTestPromotion({ id: "P1", status: "active", rules: [p1Rule], stackable: true });
    const p2 = createTestPromotion({ id: "P2", status: "active", rules: [p2Rule], stackable: true });
    await promoRepo.save(p1);
    await promoRepo.save(p2);

    const result = await useCase.execute(baseInput);
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalDiscountCents).toBe(1500);
    expect(output.appliedPromotionIds).toContain("P1");
    expect(output.appliedPromotionIds).toContain("P2");
  });

  it("picks non-stackable over stackable when higher", async () => {
    const p1Rule = DiscountRule.create({ id: "r1", type: "percentage", percentageValue: 10 }).unwrap();
    const p2Rule = DiscountRule.create({ id: "r2", type: "fixed_amount", fixedAmountValue: 500, fixedAmountCurrency: "USD" }).unwrap();
    const p3Rule = DiscountRule.create({ id: "r3", type: "fixed_amount", fixedAmountValue: 300, fixedAmountCurrency: "USD" }).unwrap();

    const p1 = createTestPromotion({ id: "P1", status: "active", rules: [p1Rule], priority: 2, stackable: false });
    const p2 = createTestPromotion({ id: "P2", status: "active", rules: [p2Rule], priority: 1, stackable: true });
    const p3 = createTestPromotion({ id: "P3", status: "active", rules: [p3Rule], priority: 0, stackable: true });
    await promoRepo.save(p1);
    await promoRepo.save(p2);
    await promoRepo.save(p3);

    const result = await useCase.execute(baseInput);
    const output = result.unwrap();
    // non-stackable: P1 = 1000; stackable: P2+P3 = 800. Non-stackable wins.
    expect(output.totalDiscountCents).toBe(1000);
    expect(output.appliedPromotionIds).toEqual(["P1"]);
  });

  it("picks stackable over non-stackable when higher", async () => {
    const p1Rule = DiscountRule.create({ id: "r1", type: "percentage", percentageValue: 5 }).unwrap();
    const p2Rule = DiscountRule.create({ id: "r2", type: "fixed_amount", fixedAmountValue: 500, fixedAmountCurrency: "USD" }).unwrap();
    const p3Rule = DiscountRule.create({ id: "r3", type: "fixed_amount", fixedAmountValue: 300, fixedAmountCurrency: "USD" }).unwrap();

    const p1 = createTestPromotion({ id: "P1", status: "active", rules: [p1Rule], priority: 2, stackable: false });
    const p2 = createTestPromotion({ id: "P2", status: "active", rules: [p2Rule], priority: 1, stackable: true });
    const p3 = createTestPromotion({ id: "P3", status: "active", rules: [p3Rule], priority: 0, stackable: true });
    await promoRepo.save(p1);
    await promoRepo.save(p2);
    await promoRepo.save(p3);

    const result = await useCase.execute(baseInput);
    const output = result.unwrap();
    // non-stackable: P1 = 500; stackable: P2+P3 = 800. Stackable wins.
    expect(output.totalDiscountCents).toBe(800);
    expect(output.appliedPromotionIds).toContain("P2");
    expect(output.appliedPromotionIds).toContain("P3");
  });

  it("includes coupon promotion in calculation", async () => {
    const rule = DiscountRule.create({ id: "r1", type: "percentage", percentageValue: 10 }).unwrap();
    const condition = EligibilityCondition.create({
      id: "cond-1",
      type: "product_ids",
      productIds: ["prod-1"],
    }).unwrap();

    const promo = createTestPromotion({ status: "active", rules: [rule], conditions: [condition], stackable: false });
    await promoRepo.save(promo);
    const coupon = createTestCoupon({ promotionId: promo.id });
    await couponRepo.save(coupon);

    const result = await useCase.execute({ ...baseInput, couponCode: "SAVE10" });
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.appliedCouponCode).toBe("SAVE10");
    expect(output.totalDiscountCents).toBe(1000);
  });

  it("handles buy_x_get_y stub (zero discount in breakdown)", async () => {
    const rule = DiscountRule.create({ id: "r1", type: "buy_x_get_y", buyQuantity: 2, getQuantity: 1 }).unwrap();
    const promo = createTestPromotion({ status: "active", rules: [rule] });
    await promoRepo.save(promo);

    const result = await useCase.execute(baseInput);
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalDiscountCents).toBe(0);
    expect(output.appliedPromotionIds).toContain(promo.id);
    expect(output.breakdown[0].ruleType).toBe("buy_x_get_y");
    expect(output.breakdown[0].buyQuantity).toBe(2);
    expect(output.breakdown[0].getQuantity).toBe(1);
  });

  it("caps discount at order total", async () => {
    const rule = DiscountRule.create({ id: "r1", type: "fixed_amount", fixedAmountValue: 50000, fixedAmountCurrency: "USD" }).unwrap();
    const promo = createTestPromotion({ status: "active", rules: [rule] });
    await promoRepo.save(promo);

    const result = await useCase.execute(baseInput);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().totalDiscountCents).toBe(10000);
  });
});
