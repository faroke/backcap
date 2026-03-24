import { describe, it, expect } from "vitest";
import { EligibilityCondition } from "../entities/eligibility-condition.entity.js";

describe("EligibilityCondition entity", () => {
  it("creates min_order_amount condition", () => {
    const result = EligibilityCondition.create({
      id: "cond-1",
      type: "min_order_amount",
      minOrderAmountCents: 5000,
      minOrderAmountCurrency: "USD",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().type).toBe("min_order_amount");
  });

  it("creates product_ids condition", () => {
    const result = EligibilityCondition.create({
      id: "cond-2",
      type: "product_ids",
      productIds: ["prod-1", "prod-2"],
    });
    expect(result.isOk()).toBe(true);
  });

  it("creates customer_segment condition", () => {
    const result = EligibilityCondition.create({
      id: "cond-3",
      type: "customer_segment",
      customerSegment: "vip",
    });
    expect(result.isOk()).toBe(true);
  });

  it("creates min_item_quantity condition", () => {
    const result = EligibilityCondition.create({
      id: "cond-4",
      type: "min_item_quantity",
      minItemQuantity: 3,
    });
    expect(result.isOk()).toBe(true);
  });

  it("rejects empty id", () => {
    expect(EligibilityCondition.create({ id: "", type: "min_order_amount", minOrderAmountCents: 100, minOrderAmountCurrency: "USD" }).isFail()).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(EligibilityCondition.create({ id: "c1", type: "bogus" }).isFail()).toBe(true);
  });

  it("rejects min_order_amount without required fields", () => {
    expect(EligibilityCondition.create({ id: "c1", type: "min_order_amount" }).isFail()).toBe(true);
  });

  it("rejects product_ids with empty array", () => {
    expect(EligibilityCondition.create({ id: "c1", type: "product_ids", productIds: [] }).isFail()).toBe(true);
  });

  it("rejects customer_segment with empty string", () => {
    expect(EligibilityCondition.create({ id: "c1", type: "customer_segment", customerSegment: "" }).isFail()).toBe(true);
  });

  it("rejects min_item_quantity with non-positive value", () => {
    expect(EligibilityCondition.create({ id: "c1", type: "min_item_quantity", minItemQuantity: 0 }).isFail()).toBe(true);
  });

  describe("isSatisfiedBy", () => {
    const context = {
      orderTotalCents: 10000,
      orderCurrency: "USD",
      productIds: ["prod-1", "prod-3"],
      customerSegment: "vip",
      totalItemQuantity: 5,
    };

    it("satisfies min_order_amount", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "min_order_amount", minOrderAmountCents: 5000, minOrderAmountCurrency: "USD" }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(true);
    });

    it("fails min_order_amount when below threshold", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "min_order_amount", minOrderAmountCents: 20000, minOrderAmountCurrency: "USD" }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(false);
    });

    it("fails min_order_amount on currency mismatch", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "min_order_amount", minOrderAmountCents: 5000, minOrderAmountCurrency: "EUR" }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(false);
    });

    it("satisfies product_ids when matching", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "product_ids", productIds: ["prod-1"] }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(true);
    });

    it("fails product_ids when no match", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "product_ids", productIds: ["prod-99"] }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(false);
    });

    it("satisfies customer_segment", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "customer_segment", customerSegment: "vip" }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(true);
    });

    it("satisfies min_item_quantity", () => {
      const cond = EligibilityCondition.create({ id: "c1", type: "min_item_quantity", minItemQuantity: 3 }).unwrap();
      expect(cond.isSatisfiedBy(context)).toBe(true);
    });
  });
});
