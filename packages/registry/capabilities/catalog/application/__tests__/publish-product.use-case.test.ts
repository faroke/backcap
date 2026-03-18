import { describe, it, expect, beforeEach } from "vitest";
import { PublishProduct } from "../use-cases/publish-product.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";

describe("PublishProduct use case", () => {
  let productRepo: InMemoryProductRepository;
  let publishProduct: PublishProduct;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    publishProduct = new PublishProduct(productRepo);

    const product = createTestProduct({ id: "prod-1" });
    await productRepo.save(product);
  });

  it("publishes a draft product", async () => {
    const result = await publishProduct.execute("prod-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event.productId).toBe("prod-1");

    const updated = await productRepo.findById("prod-1");
    expect(updated!.status.isActive()).toBe(true);
  });

  it("rejects non-existent product", async () => {
    const result = await publishProduct.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProductNotFound);
  });

  it("rejects publishing already active product", async () => {
    await publishProduct.execute("prod-1");
    const result = await publishProduct.execute("prod-1");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("draft");
  });
});
