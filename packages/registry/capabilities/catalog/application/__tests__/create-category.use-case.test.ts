import { describe, it, expect, beforeEach } from "vitest";
import { CreateCategory } from "../use-cases/create-category.use-case.js";
import { InMemoryCategoryRepository } from "./mocks/category-repository.mock.js";
import { createTestCategory } from "./fixtures/category.fixture.js";

describe("CreateCategory use case", () => {
  let categoryRepo: InMemoryCategoryRepository;
  let createCategory: CreateCategory;

  beforeEach(() => {
    categoryRepo = new InMemoryCategoryRepository();
    createCategory = new CreateCategory(categoryRepo);
  });

  it("creates a category successfully", async () => {
    const result = await createCategory.execute({
      name: "Electronics",
      slug: "electronics",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().categoryId).toBeDefined();

    const saved = await categoryRepo.findBySlug("electronics");
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe("Electronics");
  });

  it("creates category with parent", async () => {
    await categoryRepo.save(createTestCategory({ id: "parent-1", slug: "parent" }));

    const result = await createCategory.execute({
      name: "Phones",
      slug: "phones",
      parentId: "parent-1",
    });

    expect(result.isOk()).toBe(true);
    const saved = await categoryRepo.findBySlug("phones");
    expect(saved!.parentId).toBe("parent-1");
  });

  it("rejects duplicate slug", async () => {
    await categoryRepo.save(createTestCategory({ slug: "electronics" }));

    const result = await createCategory.execute({
      name: "Electronics 2",
      slug: "electronics",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("already exists");
  });

  it("rejects invalid slug", async () => {
    const result = await createCategory.execute({
      name: "Bad Slug",
      slug: "Bad Slug!",
    });

    expect(result.isFail()).toBe(true);
  });
});
