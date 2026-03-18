import { describe, it, expect, beforeEach } from "vitest";
import { AddVariant } from "../use-cases/add-variant.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import { DuplicateSKU } from "../../domain/errors/duplicate-sku.error.js";

describe("AddVariant use case", () => {
  let productRepo: InMemoryProductRepository;
  let addVariant: AddVariant;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    addVariant = new AddVariant(productRepo);

    const product = createTestProduct({ id: "prod-1" });
    await productRepo.save(product);
  });

  it("adds a variant to product", async () => {
    const result = await addVariant.execute({
      productId: "prod-1",
      sku: "VAR-001",
      priceCents: 2499,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().variantId).toBeDefined();
    expect(result.unwrap().event.sku).toBe("VAR-001");

    const updated = await productRepo.findById("prod-1");
    expect(updated!.variants).toHaveLength(1);
  });

  it("adds variant with attributes", async () => {
    const result = await addVariant.execute({
      productId: "prod-1",
      sku: "VAR-RED-XL",
      priceCents: 2999,
      attributes: { color: "red", size: "XL" },
    });

    expect(result.isOk()).toBe(true);
    const updated = await productRepo.findById("prod-1");
    expect(updated!.variants[0].attributes).toEqual({ color: "red", size: "XL" });
  });

  it("rejects non-existent product", async () => {
    const result = await addVariant.execute({
      productId: "unknown",
      sku: "VAR-001",
      priceCents: 2499,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProductNotFound);
  });

  it("rejects duplicate SKU within product", async () => {
    await addVariant.execute({
      productId: "prod-1",
      sku: "VAR-001",
      priceCents: 2499,
    });

    const result = await addVariant.execute({
      productId: "prod-1",
      sku: "VAR-001",
      priceCents: 3499,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(DuplicateSKU);
  });
});
