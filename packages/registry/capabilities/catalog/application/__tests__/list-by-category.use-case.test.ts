import { describe, it, expect, beforeEach } from "vitest";
import { ListByCategory } from "../use-cases/list-by-category.use-case.js";
import { InMemoryProductRepository } from "./mocks/product-repository.mock.js";
import { InMemoryCategoryRepository } from "./mocks/category-repository.mock.js";
import { createTestProduct } from "./fixtures/product.fixture.js";
import { createTestCategory } from "./fixtures/category.fixture.js";

describe("ListByCategory use case", () => {
  let productRepo: InMemoryProductRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let listByCategory: ListByCategory;

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository();
    categoryRepo = new InMemoryCategoryRepository();
    listByCategory = new ListByCategory(productRepo, categoryRepo);

    await categoryRepo.save(createTestCategory({ id: "cat-1", slug: "electronics" }));
  });

  it("returns products in category", async () => {
    await productRepo.save(createTestProduct({ id: "p1", categoryId: "cat-1" }));
    await productRepo.save(createTestProduct({ id: "p2", categoryId: "cat-1" }));
    await productRepo.save(createTestProduct({ id: "p3", categoryId: "cat-2" }));

    const result = await listByCategory.execute("cat-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2);
  });

  it("returns empty list for category with no products", async () => {
    const result = await listByCategory.execute("cat-1");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual([]);
  });

  it("fails for non-existent category", async () => {
    const result = await listByCategory.execute("unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("not found");
  });
});
