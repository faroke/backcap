import { describe, it, expect } from "vitest";
import { Category } from "../entities/category.entity.js";

describe("Category entity", () => {
  const validParams = {
    id: "cat-1",
    name: "Electronics",
    slug: "electronics",
  };

  it("creates a valid category", () => {
    const result = Category.create(validParams);
    expect(result.isOk()).toBe(true);
    const cat = result.unwrap();
    expect(cat.id).toBe("cat-1");
    expect(cat.name).toBe("Electronics");
    expect(cat.slug).toBe("electronics");
    expect(cat.parentId).toBeNull();
  });

  it("creates with parentId", () => {
    const result = Category.create({ ...validParams, parentId: "cat-root" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().parentId).toBe("cat-root");
  });

  it("trims name whitespace", () => {
    const result = Category.create({ ...validParams, name: "  Electronics  " });
    expect(result.unwrap().name).toBe("Electronics");
  });

  it("fails with empty name", () => {
    const result = Category.create({ ...validParams, name: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with whitespace-only name", () => {
    const result = Category.create({ ...validParams, name: "   " });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid slug", () => {
    const result = Category.create({ ...validParams, slug: "Invalid Slug!" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with single-char slug", () => {
    const result = Category.create({ ...validParams, slug: "a" });
    expect(result.isFail()).toBe(true);
  });

  it("accepts slug with hyphens", () => {
    const result = Category.create({ ...validParams, slug: "home-and-garden" });
    expect(result.isOk()).toBe(true);
  });
});
