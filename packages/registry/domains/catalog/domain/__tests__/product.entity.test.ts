import { describe, it, expect } from "vitest";
import { Product } from "../entities/product.entity.js";
import { ProductVariant } from "../entities/product-variant.entity.js";
import { Money } from "../value-objects/money.vo.js";
import { DuplicateSKU } from "../errors/duplicate-sku.error.js";

describe("Product entity", () => {
  const validParams = {
    id: "prod-1",
    name: "Test Product",
    description: "A test product",
    basePriceCents: 1999,
  };

  it("creates a valid product", () => {
    const result = Product.create(validParams);
    expect(result.isOk()).toBe(true);
    const product = result.unwrap();
    expect(product.id).toBe("prod-1");
    expect(product.name).toBe("Test Product");
    expect(product.description).toBe("A test product");
    expect(product.basePrice.cents).toBe(1999);
    expect(product.status.isDraft()).toBe(true);
    expect(product.variants).toEqual([]);
    expect(product.categoryId).toBeNull();
    expect(product.createdAt).toBeInstanceOf(Date);
  });

  it("creates product with category", () => {
    const result = Product.create({ ...validParams, categoryId: "cat-1" });
    expect(result.unwrap().categoryId).toBe("cat-1");
  });

  it("fails with empty name", () => {
    const result = Product.create({ ...validParams, name: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid price", () => {
    const result = Product.create({ ...validParams, basePriceCents: -1 });
    expect(result.isFail()).toBe(true);
  });

  describe("publish", () => {
    it("publishes a draft product", () => {
      const product = Product.create(validParams).unwrap();
      const result = product.publish();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isActive()).toBe(true);
    });

    it("fails to publish non-draft product", () => {
      const product = Product.create(validParams).unwrap().publish().unwrap();
      const result = product.publish();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().message).toContain("draft");
    });
  });

  describe("archive", () => {
    it("archives an active product", () => {
      const product = Product.create(validParams).unwrap().publish().unwrap();
      const result = product.archive();
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().status.isArchived()).toBe(true);
    });

    it("fails to archive non-active product", () => {
      const product = Product.create(validParams).unwrap();
      const result = product.archive();
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError().message).toContain("active");
    });
  });

  describe("addVariant", () => {
    it("adds a variant", () => {
      const product = Product.create(validParams).unwrap();
      const variant = ProductVariant.create({
        id: "var-1",
        productId: "prod-1",
        sku: "SKU-001",
        priceCents: 2499,
      }).unwrap();

      const result = product.addVariant(variant);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().variants).toHaveLength(1);
    });

    it("rejects duplicate SKU within product", () => {
      const product = Product.create(validParams).unwrap();
      const variant1 = ProductVariant.create({
        id: "var-1",
        productId: "prod-1",
        sku: "SKU-001",
        priceCents: 2499,
      }).unwrap();
      const variant2 = ProductVariant.create({
        id: "var-2",
        productId: "prod-1",
        sku: "SKU-001",
        priceCents: 2999,
      }).unwrap();

      const withVariant = product.addVariant(variant1).unwrap();
      const result = withVariant.addVariant(variant2);
      expect(result.isFail()).toBe(true);
      expect(result.unwrapError()).toBeInstanceOf(DuplicateSKU);
    });
  });

  describe("updatePrice", () => {
    it("updates base price", () => {
      const product = Product.create(validParams).unwrap();
      const newPrice = Money.create(2999).unwrap();
      const result = product.updatePrice(newPrice);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().basePrice.cents).toBe(2999);
    });

    it("preserves original product immutability", () => {
      const product = Product.create(validParams).unwrap();
      const newPrice = Money.create(2999).unwrap();
      product.updatePrice(newPrice);
      expect(product.basePrice.cents).toBe(1999);
    });
  });
});
