import { describe, it, expect, beforeEach } from "vitest";
import { ListProducts } from "../use-cases/list-products.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";

describe("ListProducts use case", () => {
  let productRepo: InMemoryProductRepository;
  let listProducts: ListProducts;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    listProducts = new ListProducts(productRepo);
  });

  it("returns empty list when no products", async () => {
    const result = await listProducts.execute();
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual([]);
  });

  it("returns all products", async () => {
    await productRepo.save(createTestProduct({ id: "p1", name: "Product 1" }));
    await productRepo.save(createTestProduct({ id: "p2", name: "Product 2" }));

    const result = await listProducts.execute();
    expect(result.isOk()).toBe(true);
    const products = result.unwrap();
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe("Product 1");
    expect(products[1].name).toBe("Product 2");
  });

  it("maps product to output DTO", async () => {
    await productRepo.save(createTestProduct({ id: "p1", basePriceCents: 1999 }));

    const result = await listProducts.execute();
    const product = result.unwrap()[0];
    expect(product.id).toBe("p1");
    expect(product.basePriceCents).toBe(1999);
    expect(product.status).toBe("draft");
    expect(product.variants).toEqual([]);
  });
});
