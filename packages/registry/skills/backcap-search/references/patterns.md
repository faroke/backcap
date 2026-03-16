# Search Capability — Patterns Reference

Search-specific coding patterns, conventions, and design decisions.

---

## Search Engine Abstraction

The `ISearchEngine` port abstracts the full-text search backend. The application layer never
imports Meilisearch, Algolia, Elasticsearch, or any other search library directly.

```typescript
interface ISearchEngine {
  indexDocument(indexName, documentId, document): Promise<void>
  search(params): Promise<{ hits: SearchHit[]; total: number }>
  removeDocument(indexName, documentId): Promise<boolean>
  indexExists(indexName): Promise<boolean>
  documentExists(indexName, documentId): Promise<boolean>
}
```

---

## Query Validation

The `SearchQuery` value object validates input before it reaches the search engine:

1. **Query must not be empty** — rejects whitespace-only queries.
2. **Page must be >= 1** — no zero or negative pages.
3. **Page size is capped at 100** — prevents excessive result sets.

```typescript
const queryResult = SearchQuery.create({
  query: input.query,
  filters: input.filters,
  page: input.page,
  pageSize: input.pageSize,
});

if (queryResult.isFail()) {
  return Result.fail(queryResult.unwrapError());
}
```

---

## Index Existence Checks

Both `SearchDocuments` and `IndexDocument` check index existence before operating:

```typescript
const exists = await this.searchEngine.indexExists(input.indexName);
if (!exists) {
  return Result.fail(IndexNotFound.create(input.indexName));
}
```

`RemoveFromIndex` additionally checks document existence:

```typescript
const docExists = await this.searchEngine.documentExists(input.indexName, input.documentId);
if (!docExists) {
  return Result.fail(DocumentNotFound.create(input.documentId));
}
```

---

## Result Pattern in Search

All expected failures use `Result<T, E>`:

```typescript
async execute(input: SearchDocumentsInput): Promise<Result<SearchDocumentsOutput, Error>>
async execute(input: RemoveFromIndexInput): Promise<Result<RemoveFromIndexOutput, Error>>
```

---

## Mock Pattern for Tests

The `InMemorySearchEngine` uses nested `Map<string, Map<string, Record<string, unknown>>>`:

```typescript
class InMemorySearchEngine implements ISearchEngine {
  private indexes = new Map<string, Map<string, Record<string, unknown>>>();

  createIndex(name: string): void {
    this.indexes.set(name, new Map());
  }

  async search(params) {
    // JSON.stringify match for simplicity
    const queryLower = params.query.toLowerCase();
    const matched = allDocs.filter(({ document }) =>
      JSON.stringify(document).toLowerCase().includes(queryLower)
    );
  }
}
```

Helper methods `documentExists`, `getDocumentCount` are available for assertions.
