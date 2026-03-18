import { describe, it, expect, beforeEach } from "vitest";
import { CreateProduct } from "../use-cases/create-product.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";

describe("CreateProduct use case", () => {
  let productRepo: InMemoryProductRepository;
  let createProduct: CreateProduct;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    createProduct = new CreateProduct(productRepo);
  });

  it("creates a product successfully", async () => {
    const result = await createProduct.execute({
      name: "New Product",
      description: "A great product",
      basePriceCents: 1999,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.productId).toBeDefined();
    expect(output.event.productId).toBe(output.productId);
    expect(output.event.name).toBe("New Product");

    const saved = await productRepo.findById(output.productId);
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe("New Product");
    expect(saved!.status.isDraft()).toBe(true);
  });

  it("creates product with category", async () => {
    const result = await createProduct.execute({
      name: "Categorized Product",
      description: "With category",
      basePriceCents: 999,
      categoryId: "cat-1",
    });

    expect(result.isOk()).toBe(true);
    const saved = await productRepo.findById(result.unwrap().productId);
    expect(saved!.categoryId).toBe("cat-1");
  });

  it("rejects empty name", async () => {
    const result = await createProduct.execute({
      name: "",
      description: "No name",
      basePriceCents: 999,
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid price", async () => {
    const result = await createProduct.execute({
      name: "Product",
      description: "Bad price",
      basePriceCents: -100,
    });

    expect(result.isFail()).toBe(true);
  });
});
