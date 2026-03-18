import { describe, it, expect, beforeEach } from "vitest";
import { GetProduct } from "../use-cases/get-product.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";
import { ProductNotFound } from "../../domain/errors/product-not-found.error.js";

describe("GetProduct use case", () => {
  let productRepo: InMemoryProductRepository;
  let getProduct: GetProduct;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    getProduct = new GetProduct(productRepo);

    await productRepo.save(createTestProduct({ id: "prod-1", name: "My Product" }));
  });

  it("returns a product by id", async () => {
    const result = await getProduct.execute("prod-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe("My Product");
  });

  it("fails for non-existent product", async () => {
    const result = await getProduct.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProductNotFound);
  });
});
