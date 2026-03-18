import { describe, it, expect } from "vitest";
import { ProductNotFound } from "../errors/product-not-found.error.js";
import { DuplicateSKU } from "../errors/duplicate-sku.error.js";
import { InvalidPrice } from "../errors/invalid-price.error.js";

describe("Domain errors", () => {
  describe("ProductNotFound", () => {
    it("creates with static factory", () => {
      const error = ProductNotFound.create("prod-123");
      expect(error).toBeInstanceOf(ProductNotFound);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("prod-123");
    });

    it("has correct name", () => {
      expect(new ProductNotFound("test").name).toBe("ProductNotFound");
    });
  });

  describe("DuplicateSKU", () => {
    it("creates with static factory", () => {
      const error = DuplicateSKU.create("SKU-001");
      expect(error).toBeInstanceOf(DuplicateSKU);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("SKU-001");
    });

    it("has correct name", () => {
      expect(new DuplicateSKU("test").name).toBe("DuplicateSKU");
    });
  });

  describe("InvalidPrice", () => {
    it("creates with static factory", () => {
      const error = InvalidPrice.create("negative amount");
      expect(error).toBeInstanceOf(InvalidPrice);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("negative amount");
    });

    it("has correct name", () => {
      expect(new InvalidPrice("test").name).toBe("InvalidPrice");
    });
  });
});
