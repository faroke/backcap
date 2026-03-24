import { describe, it, expect } from "vitest";
import { DiscountRule } from "../entities/discount-rule.entity.js";

const validPercentageParams = {
  id: "rule-1",
  type: "percentage",
  percentageValue: 10,
};

const validFixedParams = {
  id: "rule-2",
  type: "fixed_amount",
  fixedAmountValue: 500,
  fixedAmountCurrency: "USD",
};

const validBuyXGetYParams = {
  id: "rule-3",
  type: "buy_x_get_y",
  buyQuantity: 2,
  getQuantity: 1,
};

describe("DiscountRule entity", () => {
  it("creates a percentage rule", () => {
    const result = DiscountRule.create(validPercentageParams);
    expect(result.isOk()).toBe(true);
    const rule = result.unwrap();
    expect(rule.id).toBe("rule-1");
    expect(rule.type.isPercentage()).toBe(true);
    expect(rule.percentageValue).toBe(10);
  });

  it("creates a percentage rule with max discount cap", () => {
    const result = DiscountRule.create({
      ...validPercentageParams,
      maxDiscountAmountValue: 200,
      maxDiscountAmountCurrency: "USD",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().maxDiscountAmount).toBeDefined();
  });

  it("creates a fixed amount rule", () => {
    const result = DiscountRule.create(validFixedParams);
    expect(result.isOk()).toBe(true);
    const rule = result.unwrap();
    expect(rule.fixedAmount!.amount).toBe(500);
  });

  it("creates a buy_x_get_y rule", () => {
    const result = DiscountRule.create(validBuyXGetYParams);
    expect(result.isOk()).toBe(true);
    const rule = result.unwrap();
    expect(rule.buyQuantity).toBe(2);
    expect(rule.getQuantity).toBe(1);
  });

  it("rejects empty id", () => {
    expect(DiscountRule.create({ ...validPercentageParams, id: "" }).isFail()).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(DiscountRule.create({ ...validPercentageParams, type: "bogus" }).isFail()).toBe(true);
  });

  it("rejects percentage <= 0", () => {
    expect(DiscountRule.create({ ...validPercentageParams, percentageValue: 0 }).isFail()).toBe(true);
  });

  it("rejects percentage > 100", () => {
    expect(DiscountRule.create({ ...validPercentageParams, percentageValue: 101 }).isFail()).toBe(true);
  });

  it("rejects fixed_amount without value", () => {
    expect(DiscountRule.create({ id: "r1", type: "fixed_amount" }).isFail()).toBe(true);
  });

  it("rejects buy_x_get_y without quantities", () => {
    expect(DiscountRule.create({ id: "r1", type: "buy_x_get_y" }).isFail()).toBe(true);
  });

  it("rejects buy_x_get_y with non-positive quantities", () => {
    expect(DiscountRule.create({ id: "r1", type: "buy_x_get_y", buyQuantity: 0, getQuantity: 1 }).isFail()).toBe(true);
  });

  describe("calculateDiscount", () => {
    it("calculates percentage discount", () => {
      const rule = DiscountRule.create(validPercentageParams).unwrap();
      const result = rule.calculateDiscount(10000, "USD");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(1000);
    });

    it("caps percentage discount at maxDiscountAmount", () => {
      const rule = DiscountRule.create({
        ...validPercentageParams,
        percentageValue: 50,
        maxDiscountAmountValue: 200,
        maxDiscountAmountCurrency: "USD",
      }).unwrap();
      const result = rule.calculateDiscount(10000, "USD");
      expect(result.unwrap().amount).toBe(200);
    });

    it("returns fixed amount", () => {
      const rule = DiscountRule.create(validFixedParams).unwrap();
      const result = rule.calculateDiscount(10000, "USD");
      expect(result.unwrap().amount).toBe(500);
    });

    it("fails on currency mismatch for fixed amount", () => {
      const rule = DiscountRule.create(validFixedParams).unwrap();
      expect(rule.calculateDiscount(10000, "EUR").isFail()).toBe(true);
    });

    it("returns zero for buy_x_get_y (stub)", () => {
      const rule = DiscountRule.create(validBuyXGetYParams).unwrap();
      const result = rule.calculateDiscount(10000, "USD");
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().amount).toBe(0);
    });
  });
});
