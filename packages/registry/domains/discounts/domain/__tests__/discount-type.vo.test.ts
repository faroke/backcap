import { describe, it, expect } from "vitest";
import { DiscountType } from "../value-objects/discount-type.vo.js";

describe("DiscountType VO", () => {
  it("creates a percentage type", () => {
    const result = DiscountType.create("percentage");
    expect(result.isOk()).toBe(true);
    const type = result.unwrap();
    expect(type.value).toBe("percentage");
    expect(type.isPercentage()).toBe(true);
    expect(type.isFixedAmount()).toBe(false);
    expect(type.isBuyXGetY()).toBe(false);
  });

  it("creates a fixed_amount type", () => {
    const result = DiscountType.create("fixed_amount");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().isFixedAmount()).toBe(true);
  });

  it("creates a buy_x_get_y type", () => {
    const result = DiscountType.create("buy_x_get_y");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().isBuyXGetY()).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = DiscountType.create("bogus");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("bogus");
  });
});
