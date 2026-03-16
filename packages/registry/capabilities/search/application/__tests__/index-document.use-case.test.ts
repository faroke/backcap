import { describe, it, expect, beforeEach } from "vitest";
import { IndexDocument } from "../use-cases/index-document.use-case.js";
import { InMemorySearchEngine } from "./mocks/search-engine.mock.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";

describe("IndexDocument use case", () => {
  let searchEngine: InMemorySearchEngine;
  let indexDocument: IndexDocument;

  beforeEach(() => {
    searchEngine = new InMemorySearchEngine();
    indexDocument = new IndexDocument(searchEngine);
  });

  it("indexes a document successfully when index exists", async () => {
    searchEngine.createIndex("products");

    const result = await indexDocument.execute({
      indexName: "products",
      documentId: "doc-1",
      document: { title: "Laptop", price: 999 },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.documentId).toBe("doc-1");
    expect(output.indexedAt).toBeInstanceOf(Date);
  });

  it("returns IndexNotFound error when index does not exist", async () => {
    const result = await indexDocument.execute({
      indexName: "nonexistent",
      documentId: "doc-1",
      document: { title: "Laptop" },
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(IndexNotFound);
  });

  it("document is retrievable after indexing", async () => {
    searchEngine.createIndex("products");

    await indexDocument.execute({
      indexName: "products",
      documentId: "doc-2",
      document: { title: "Phone", brand: "Samsung" },
    });

    const exists = await searchEngine.documentExists("products", "doc-2");
    expect(exists).toBe(true);
  });

  it("indexes multiple documents into the same index", async () => {
    searchEngine.createIndex("products");

    await indexDocument.execute({
      indexName: "products",
      documentId: "doc-1",
      document: { title: "Laptop" },
    });
    await indexDocument.execute({
      indexName: "products",
      documentId: "doc-2",
      document: { title: "Phone" },
    });

    expect(searchEngine.getDocumentCount("products")).toBe(2);
  });

  it("overwrites an existing document with the same id", async () => {
    searchEngine.createIndex("products");

    await indexDocument.execute({
      indexName: "products",
      documentId: "doc-1",
      document: { title: "Old Laptop", price: 800 },
    });
    const result = await indexDocument.execute({
      indexName: "products",
      documentId: "doc-1",
      document: { title: "New Laptop", price: 1200 },
    });

    expect(result.isOk()).toBe(true);
    // Count should still be 1 (overwrite, not duplicate)
    expect(searchEngine.getDocumentCount("products")).toBe(1);
  });
});
