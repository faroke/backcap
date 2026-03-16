import { describe, it, expect } from "vitest";
import { SearchIndex } from "../entities/search-index.entity.js";

describe("SearchIndex entity", () => {
  const validParams = {
    id: "index-1",
    name: "products",
  };

  it("creates a valid search index with defaults", () => {
    const result = SearchIndex.create(validParams);
    expect(result.isOk()).toBe(true);
    const index = result.unwrap();
    expect(index.id).toBe("index-1");
    expect(index.name).toBe("products");
    expect(index.documentCount).toBe(0);
    expect(index.createdAt).toBeInstanceOf(Date);
    expect(index.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a search index with explicit documentCount", () => {
    const result = SearchIndex.create({ ...validParams, documentCount: 42 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().documentCount).toBe(42);
  });

  it("fails when name is empty", () => {
    const result = SearchIndex.create({ id: "index-1", name: "  " });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("empty");
  });

  it("fails when documentCount is negative", () => {
    const result = SearchIndex.create({ ...validParams, documentCount: -1 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("negative");
  });

  it("incrementCount returns new index with count increased by 1", () => {
    const index = SearchIndex.create({ ...validParams, documentCount: 5 }).unwrap();
    const updated = index.incrementCount();
    expect(updated.documentCount).toBe(6);
    // original is immutable
    expect(index.documentCount).toBe(5);
  });

  it("decrementCount returns new index with count decreased by 1", () => {
    const index = SearchIndex.create({ ...validParams, documentCount: 3 }).unwrap();
    const updated = index.decrementCount();
    expect(updated.documentCount).toBe(2);
    expect(index.documentCount).toBe(3);
  });

  it("decrementCount never goes below 0", () => {
    const index = SearchIndex.create({ ...validParams, documentCount: 0 }).unwrap();
    const updated = index.decrementCount();
    expect(updated.documentCount).toBe(0);
  });

  it("incrementCount and decrementCount update updatedAt", () => {
    const index = SearchIndex.create(validParams).unwrap();
    const incremented = index.incrementCount();
    expect(incremented.updatedAt.getTime()).toBeGreaterThanOrEqual(
      index.updatedAt.getTime(),
    );
  });

  it("preserves id and name across mutations", () => {
    const index = SearchIndex.create(validParams).unwrap();
    const after = index.incrementCount().decrementCount();
    expect(after.id).toBe("index-1");
    expect(after.name).toBe("products");
  });
});
