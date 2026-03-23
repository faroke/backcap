import { describe, it, expect } from "vitest";
import { ProductCreated } from "../events/product-created.event.js";
import { ProductPublished } from "../events/product-published.event.js";
import { ProductArchived } from "../events/product-archived.event.js";
import { VariantAdded } from "../events/variant-added.event.js";

describe("Domain events", () => {
  describe("ProductCreated", () => {
    it("constructs with explicit occurredAt", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const event = new ProductCreated("prod-1", "Test Product", date);
      expect(event.productId).toBe("prod-1");
      expect(event.name).toBe("Test Product");
      expect(event.occurredAt).toBe(date);
    });

    it("constructs with default occurredAt", () => {
      const before = new Date();
      const event = new ProductCreated("prod-1", "Test Product");
      const after = new Date();
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("ProductPublished", () => {
    it("constructs with productId", () => {
      const event = new ProductPublished("prod-1");
      expect(event.productId).toBe("prod-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });

  describe("ProductArchived", () => {
    it("constructs with productId", () => {
      const event = new ProductArchived("prod-1");
      expect(event.productId).toBe("prod-1");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });

  describe("VariantAdded", () => {
    it("constructs with all fields", () => {
      const event = new VariantAdded("prod-1", "var-1", "SKU-001");
      expect(event.productId).toBe("prod-1");
      expect(event.variantId).toBe("var-1");
      expect(event.sku).toBe("SKU-001");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });
  });
});
