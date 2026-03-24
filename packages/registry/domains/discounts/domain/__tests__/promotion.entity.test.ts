import { describe, it, expect } from "vitest";
import { Promotion } from "../entities/promotion.entity.js";
import { DiscountRule } from "../entities/discount-rule.entity.js";
import { EligibilityCondition } from "../entities/eligibility-condition.entity.js";

const now = new Date();
const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

function makeRule(overrides?: Record<string, unknown>) {
  return DiscountRule.create({
    id: "rule-1",
    type: "percentage",
    percentageValue: 10,
    ...overrides,
  }).unwrap();
}

const validParams = {
  id: "promo-1",
  name: "Test Promo",
  rules: [makeRule()],
  startDate: now,
  endDate: future,
};

describe("Promotion entity", () => {
  it("creates a valid promotion with defaults", () => {
    const result = Promotion.create(validParams);
    expect(result.isOk()).toBe(true);
    const promo = result.unwrap();
    expect(promo.status.isDraft()).toBe(true);
    expect(promo.stackable).toBe(false);
    expect(promo.priority).toBe(0);
    expect(promo.description).toBe("");
    expect(promo.conditions).toHaveLength(0);
  });

  it("rejects empty id", () => {
    expect(Promotion.create({ ...validParams, id: "" }).isFail()).toBe(true);
  });

  it("rejects empty name", () => {
    expect(Promotion.create({ ...validParams, name: "" }).isFail()).toBe(true);
  });

  it("rejects empty rules", () => {
    expect(Promotion.create({ ...validParams, rules: [] }).isFail()).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(Promotion.create({ ...validParams, status: "bogus" }).isFail()).toBe(true);
  });

  it("activates from draft", () => {
    const promo = Promotion.create(validParams).unwrap();
    const result = promo.activate();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status.isActive()).toBe(true);
  });

  it("activates from inactive", () => {
    const promo = Promotion.create({ ...validParams, status: "inactive" }).unwrap();
    expect(promo.activate().isOk()).toBe(true);
  });

  it("fails to activate when already active", () => {
    const promo = Promotion.create({ ...validParams, status: "active" }).unwrap();
    expect(promo.activate().isFail()).toBe(true);
  });

  it("deactivates from active", () => {
    const promo = Promotion.create({ ...validParams, status: "active" }).unwrap();
    const result = promo.deactivate();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status.isInactive()).toBe(true);
  });

  it("fails to deactivate from draft", () => {
    const promo = Promotion.create(validParams).unwrap();
    expect(promo.deactivate().isFail()).toBe(true);
  });

  it("checks eligibility", () => {
    const condition = EligibilityCondition.create({
      id: "cond-1",
      type: "min_order_amount",
      minOrderAmountCents: 5000,
      minOrderAmountCurrency: "USD",
    }).unwrap();

    const promo = Promotion.create({
      ...validParams,
      status: "active",
      conditions: [condition],
    }).unwrap();

    const context = { orderTotalCents: 10000, orderCurrency: "USD", productIds: [], totalItemQuantity: 1 };
    expect(promo.isEligible(context)).toBe(true);

    expect(promo.isEligible({ ...context, orderTotalCents: 3000 })).toBe(false);
  });

  it("isEligible returns false when not active", () => {
    const promo = Promotion.create(validParams).unwrap();
    expect(promo.isEligible({ orderTotalCents: 10000, orderCurrency: "USD", productIds: [], totalItemQuantity: 1 })).toBe(false);
  });

  it("calculates total discount", () => {
    const promo = Promotion.create(validParams).unwrap();
    const result = promo.calculateTotalDiscount(10000, "USD");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(1000);
  });

  it("caps discount at order total", () => {
    const rule = DiscountRule.create({ id: "r1", type: "fixed_amount", fixedAmountValue: 15000, fixedAmountCurrency: "USD" }).unwrap();
    const promo = Promotion.create({ ...validParams, rules: [rule] }).unwrap();
    const result = promo.calculateTotalDiscount(10000, "USD");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().amount).toBe(10000);
  });
});
