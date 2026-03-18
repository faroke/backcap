import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../catalog-search.bridge.js";

describe("catalog-search bridge", () => {
  const product = {
    id: "prod-1",
    name: "Wireless Headphones",
    description: "Premium noise-canceling headphones",
    status: "published",
    basePriceCents: 14999,
    currency: "USD",
    categoryId: "cat-electronics",
    variants: [
      { id: "var-1", sku: "WH-BLK", priceCents: 14999, currency: "USD", attributes: { color: "black" } },
      { id: "var-2", sku: "WH-WHT", priceCents: 15999, currency: "USD", attributes: { color: "white" } },
    ],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  function mockGetProduct(result: typeof product | null) {
    return {
      execute: vi.fn().mockResolvedValue(
        result
          ? { isOk: () => true, isFail: () => false, unwrap: () => result }
          : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("not found") },
      ),
    };
  }

  function mockIndexDocument(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? { isOk: () => true, isFail: () => false }
          : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("index not found") },
      ),
    };
  }

  it("indexes product in search on ProductPublished", async () => {
    const bus = new InMemoryEventBus();
    const getProduct = mockGetProduct(product);
    const indexDocument = mockIndexDocument();
    const bridge = createBridge({ getProduct, indexDocument });
    const publishedAt = new Date("2026-03-18T10:00:00Z");

    bridge.wire(bus);

    await bus.publish("ProductPublished", { productId: "prod-1", occurredAt: publishedAt });

    expect(getProduct.execute).toHaveBeenCalledWith("prod-1");
    expect(indexDocument.execute).toHaveBeenCalledOnce();
    expect(indexDocument.execute).toHaveBeenCalledWith({
      indexName: "products",
      documentId: "prod-1",
      document: {
        name: "Wireless Headphones",
        description: "Premium noise-canceling headphones",
        basePriceCents: 14999,
        currency: "USD",
        categoryId: "cat-electronics",
        variants: [
          { sku: "WH-BLK", priceCents: 14999, attributes: { color: "black" } },
          { sku: "WH-WHT", priceCents: 15999, attributes: { color: "white" } },
        ],
        publishedAt,
      },
    });
  });

  it("skips indexing when product is not found", async () => {
    const bus = new InMemoryEventBus();
    const getProduct = mockGetProduct(null);
    const indexDocument = mockIndexDocument();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getProduct, indexDocument });

    bridge.wire(bus);

    await bus.publish("ProductPublished", { productId: "prod-unknown", occurredAt: new Date() });

    expect(indexDocument.execute).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("skips indexing when product is not published (race condition)", async () => {
    const bus = new InMemoryEventBus();
    const draftProduct = { ...product, status: "draft" };
    const getProduct = mockGetProduct(draftProduct);
    const indexDocument = mockIndexDocument();
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bridge = createBridge({ getProduct, indexDocument });

    bridge.wire(bus);

    await bus.publish("ProductPublished", { productId: "prod-1", occurredAt: new Date() });

    expect(indexDocument.execute).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("not published"),
      expect.anything(),
    );
    consoleSpy.mockRestore();
  });

  it("logs error when indexDocument returns a failed Result", async () => {
    const bus = new InMemoryEventBus();
    const getProduct = mockGetProduct(product);
    const indexDocument = mockIndexDocument(false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getProduct, indexDocument });

    bridge.wire(bus);

    await bus.publish("ProductPublished", { productId: "prod-1", occurredAt: new Date() });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("IndexDocument failed"),
      expect.anything(),
      expect.anything(),
    );
    consoleSpy.mockRestore();
  });

  it("handles indexDocument thrown exception gracefully", async () => {
    const bus = new InMemoryEventBus();
    const getProduct = mockGetProduct(product);
    const indexDocument = { execute: vi.fn().mockRejectedValue(new Error("search unavailable")) };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getProduct, indexDocument });

    bridge.wire(bus);

    await expect(
      bus.publish("ProductPublished", { productId: "prod-1", occurredAt: new Date() }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles getProduct thrown exception gracefully", async () => {
    const bus = new InMemoryEventBus();
    const getProduct = { execute: vi.fn().mockRejectedValue(new Error("catalog down")) };
    const indexDocument = mockIndexDocument();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bridge = createBridge({ getProduct, indexDocument });

    bridge.wire(bus);

    await expect(
      bus.publish("ProductPublished", { productId: "prod-1", occurredAt: new Date() }),
    ).resolves.toBeUndefined();

    expect(indexDocument.execute).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
