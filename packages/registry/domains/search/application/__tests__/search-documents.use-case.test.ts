import { describe, it, expect, beforeEach } from "vitest";
import { SearchDocuments } from "../use-cases/search-documents.use-case.js";
import { InMemorySearchEngine } from "./mocks/search-engine.mock.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";
import { InvalidQuery } from "../../domain/errors/invalid-query.error.js";

describe("SearchDocuments use case", () => {
  let searchEngine: InMemorySearchEngine;
  let searchDocuments: SearchDocuments;

  beforeEach(() => {
    searchEngine = new InMemorySearchEngine();
    searchDocuments = new SearchDocuments(searchEngine);
  });

  it("returns matching documents from an existing index", async () => {
    searchEngine.createIndex("products");
    await searchEngine.indexDocument("products", "doc-1", { title: "Laptop Pro", price: 999 });
    await searchEngine.indexDocument("products", "doc-2", { title: "Phone Basic", price: 499 });

    const result = await searchDocuments.execute({
      indexName: "products",
      query: "laptop",
      page: 1,
      pageSize: 10,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.total).toBe(1);
    expect(output.hits).toHaveLength(1);
    expect(output.hits[0].id).toBe("doc-1");
    expect(output.page).toBe(1);
    expect(output.pageSize).toBe(10);
  });

  it("returns empty results when no documents match", async () => {
    searchEngine.createIndex("products");
    await searchEngine.indexDocument("products", "doc-1", { title: "Laptop" });

    const result = await searchDocuments.execute({
      indexName: "products",
      query: "phone",
      page: 1,
      pageSize: 10,
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().total).toBe(0);
    expect(result.unwrap().hits).toHaveLength(0);
  });

  it("fails with IndexNotFound when index does not exist", async () => {
    const result = await searchDocuments.execute({
      indexName: "nonexistent",
      query: "test",
      page: 1,
      pageSize: 10,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(IndexNotFound);
  });

  it("fails with InvalidQuery when query is empty", async () => {
    searchEngine.createIndex("products");

    const result = await searchDocuments.execute({
      indexName: "products",
      query: "   ",
      page: 1,
      pageSize: 10,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidQuery);
  });

  it("fails with InvalidQuery when page is less than 1", async () => {
    searchEngine.createIndex("products");

    const result = await searchDocuments.execute({
      indexName: "products",
      query: "test",
      page: 0,
      pageSize: 10,
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidQuery);
  });

  it("paginates results correctly", async () => {
    searchEngine.createIndex("products");
    await searchEngine.indexDocument("products", "doc-1", { title: "Item A" });
    await searchEngine.indexDocument("products", "doc-2", { title: "Item B" });
    await searchEngine.indexDocument("products", "doc-3", { title: "Item C" });

    const result = await searchDocuments.execute({
      indexName: "products",
      query: "item",
      page: 2,
      pageSize: 1,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.total).toBe(3);
    expect(output.hits).toHaveLength(1);
    expect(output.page).toBe(2);
    expect(output.pageSize).toBe(1);
  });
});
