import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createPriceLookup, createBridge } from "../catalog-cart.bridge.js";

describe("catalog-cart bridge", () => {
  const publishedProduct = {
    id: "prod-1",
    name: "T-Shirt",
    description: "A nice t-shirt",
    status: "published",
    basePriceCents: 2999,
    currency: "USD",
    categoryId: null,
    variants: [
      { id: "var-1", sku: "TS-S", priceCents: 2999, currency: "USD", attributes: { size: "S" } },
      { id: "var-2", sku: "TS-M", priceCents: 3499, currency: "USD", attributes: { size: "M" } },
    ],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  function mockGetProduct(product: typeof publishedProduct | null) {
    return {
      execute: vi.fn().mockResolvedValue(
        product
          ? { isOk: () => true, isFail: () => false, unwrap: () => product }
          : { isOk: () => false, isFail: () => true, unwrap: () => { throw new Error("not found"); } },
      ),
    };
  }

  it("returns price info for a published product variant", async () => {
    const getProduct = mockGetProduct(publishedProduct);
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-1", "var-1");

    expect(result).toEqual({
      productId: "prod-1",
      variantId: "var-1",
      priceCents: 2999,
      currency: "USD",
    });
    expect(getProduct.execute).toHaveBeenCalledWith("prod-1");
  });

  it("returns correct price for a different variant", async () => {
    const getProduct = mockGetProduct(publishedProduct);
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-1", "var-2");

    expect(result).toEqual({
      productId: "prod-1",
      variantId: "var-2",
      priceCents: 3499,
      currency: "USD",
    });
  });

  it("returns null when product is not found", async () => {
    const getProduct = mockGetProduct(null);
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-unknown", "var-1");

    expect(result).toBeNull();
  });

  it("returns null when product is not published", async () => {
    const draftProduct = { ...publishedProduct, status: "draft" };
    const getProduct = mockGetProduct(draftProduct);
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-1", "var-1");

    expect(result).toBeNull();
  });

  it("returns null when variant is not found", async () => {
    const getProduct = mockGetProduct(publishedProduct);
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-1", "var-unknown");

    expect(result).toBeNull();
  });

  it("returns null and logs error when getProduct throws", async () => {
    const getProduct = {
      execute: vi.fn().mockRejectedValue(new Error("catalog unavailable")),
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const lookup = createPriceLookup({ getProduct });

    const result = await lookup.getPrice("prod-1", "var-1");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("createBridge returns a valid Bridge with no-op wire", () => {
    const bus = new InMemoryEventBus();
    const bridge = createBridge();

    expect(() => bridge.wire(bus)).not.toThrow();
  });
});
