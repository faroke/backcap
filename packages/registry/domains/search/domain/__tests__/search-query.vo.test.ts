import { describe, it, expect } from "vitest";
import { SearchQuery } from "../value-objects/search-query.vo.js";
import { InvalidQuery } from "../errors/invalid-query.error.js";

describe("SearchQuery value object", () => {
  it("creates a valid search query with defaults", () => {
    const result = SearchQuery.create({ query: "laptop" });
    expect(result.isOk()).toBe(true);
    const sq = result.unwrap();
    expect(sq.query).toBe("laptop");
    expect(sq.filters).toBeUndefined();
    expect(sq.pagination.page).toBe(1);
    expect(sq.pagination.pageSize).toBe(10);
  });

  it("trims whitespace from query", () => {
    const result = SearchQuery.create({ query: "  phone  " });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().query).toBe("phone");
  });

  it("fails with empty query string", () => {
    const result = SearchQuery.create({ query: "   " });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidQuery);
  });

  it("accepts filters as Record<string, string>", () => {
    const filters = { category: "electronics", brand: "apple" };
    const result = SearchQuery.create({ query: "phone", filters });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().filters).toEqual(filters);
  });

  it("accepts filters with array values", () => {
    const filters = { tags: ["new", "sale"] };
    const result = SearchQuery.create({ query: "phone", filters });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().filters).toEqual(filters);
  });

  it("clamps pageSize to max 100", () => {
    const result = SearchQuery.create({ query: "test", pageSize: 500 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().pagination.pageSize).toBe(100);
  });

  it("uses provided page and pageSize when within limits", () => {
    const result = SearchQuery.create({ query: "test", page: 3, pageSize: 25 });
    expect(result.isOk()).toBe(true);
    const sq = result.unwrap();
    expect(sq.pagination.page).toBe(3);
    expect(sq.pagination.pageSize).toBe(25);
  });

  it("fails when page is less than 1", () => {
    const result = SearchQuery.create({ query: "test", page: 0 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidQuery);
  });

  it("allows pageSize of exactly 100 without clamping", () => {
    const result = SearchQuery.create({ query: "test", pageSize: 100 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().pagination.pageSize).toBe(100);
  });
});
