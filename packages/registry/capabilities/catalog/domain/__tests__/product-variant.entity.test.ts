import { describe, it, expect } from "vitest";
import { ProductVariant } from "../entities/product-variant.entity.js";

describe("ProductVariant entity", () => {
  const validParams = {
    id: "var-1",
    productId: "prod-1",
    sku: "SKU-001",
    priceCents: 2499,
  };

  it("creates a valid variant", () => {
    const result = ProductVariant.create(validParams);
    expect(result.isOk()).toBe(true);
    const variant = result.unwrap();
    expect(variant.id).toBe("var-1");
    expect(variant.productId).toBe("prod-1");
    expect(variant.sku.value).toBe("SKU-001");
    expect(variant.price.cents).toBe(2499);
    expect(variant.attributes).toEqual({});
  });

  it("creates with attributes", () => {
    const result = ProductVariant.create({
      ...validParams,
      attributes: { color: "red", size: "XL" },
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().attributes).toEqual({ color: "red", size: "XL" });
  });

  it("creates with custom currency", () => {
    const result = ProductVariant.create({
      ...validParams,
      currency: "EUR",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().price.currency).toBe("EUR");
  });

  it("fails with invalid SKU", () => {
    const result = ProductVariant.create({ ...validParams, sku: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid price", () => {
    const result = ProductVariant.create({ ...validParams, priceCents: -100 });
    expect(result.isFail()).toBe(true);
  });
});
