import { describe, it, expect, beforeEach } from "vitest";
import { RemoveFromIndex } from "../use-cases/remove-from-index.use-case.js";
import { InMemorySearchEngine } from "./mocks/search-engine.mock.js";
import { IndexNotFound } from "../../domain/errors/index-not-found.error.js";
import { DocumentNotFound } from "../../domain/errors/document-not-found.error.js";

describe("RemoveFromIndex use case", () => {
  let searchEngine: InMemorySearchEngine;
  let removeFromIndex: RemoveFromIndex;

  beforeEach(() => {
    searchEngine = new InMemorySearchEngine();
    removeFromIndex = new RemoveFromIndex(searchEngine);
  });

  it("removes an existing document successfully", async () => {
    searchEngine.createIndex("products");
    await searchEngine.indexDocument("products", "doc-1", { title: "Laptop" });

    const result = await removeFromIndex.execute({
      indexName: "products",
      documentId: "doc-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.documentId).toBe("doc-1");
    expect(output.removedAt).toBeInstanceOf(Date);

    const exists = await searchEngine.documentExists("products", "doc-1");
    expect(exists).toBe(false);
  });

  it("fails with IndexNotFound when index does not exist", async () => {
    const result = await removeFromIndex.execute({
      indexName: "nonexistent",
      documentId: "doc-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(IndexNotFound);
  });

  it("fails with DocumentNotFound when document does not exist", async () => {
    searchEngine.createIndex("products");

    const result = await removeFromIndex.execute({
      indexName: "products",
      documentId: "missing",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(DocumentNotFound);
  });

  it("does not affect other documents when removing one", async () => {
    searchEngine.createIndex("products");
    await searchEngine.indexDocument("products", "doc-1", { title: "Laptop" });
    await searchEngine.indexDocument("products", "doc-2", { title: "Phone" });

    await removeFromIndex.execute({
      indexName: "products",
      documentId: "doc-1",
    });

    expect(searchEngine.getDocumentCount("products")).toBe(1);
    const exists = await searchEngine.documentExists("products", "doc-2");
    expect(exists).toBe(true);
  });
});
