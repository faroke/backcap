import { describe, it, expect, beforeEach } from "vitest";
import { UpdatePrice } from "../use-cases/update-price.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";
import { InvalidPrice } from "../../domain/errors/invalid-price.error.js";

describe("UpdatePrice use case", () => {
  let productRepo: InMemoryProductRepository;
  let updatePrice: UpdatePrice;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    updatePrice = new UpdatePrice(productRepo);

    const product = createTestProduct({ id: "prod-1", basePriceCents: 1999 });
    await productRepo.save(product);
  });

  it("updates the price successfully", async () => {
    const result = await updatePrice.execute({
      productId: "prod-1",
      priceCents: 2999,
    });

    expect(result.isOk()).toBe(true);
    const updated = await productRepo.findById("prod-1");
    expect(updated!.basePrice.cents).toBe(2999);
  });

  it("preserves currency if not specified", async () => {
    const result = await updatePrice.execute({
      productId: "prod-1",
      priceCents: 2999,
    });

    expect(result.isOk()).toBe(true);
    const updated = await productRepo.findById("prod-1");
    expect(updated!.basePrice.currency).toBe("USD");
  });

  it("rejects non-existent product", async () => {
    const result = await updatePrice.execute({
      productId: "unknown",
      priceCents: 2999,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProductNotFound);
  });

  it("rejects invalid price", async () => {
    const result = await updatePrice.execute({
      productId: "prod-1",
      priceCents: -100,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidPrice);
  });
});
