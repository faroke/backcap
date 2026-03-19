---
title: Search Capability
description: Full-text search for TypeScript backends — index documents, search with filters, and paginate results.
---

The `search` capability provides **full-text search** for TypeScript backends. It offers a provider-agnostic port interface that allows you to plug in Meilisearch, Algolia, Typesense, Elasticsearch, or a database-native solution.

## Install

```bash
npx @backcap/cli add search
```

## Domain Model

### SearchIndex Entity

The `SearchIndex` entity represents a named search index and tracks its document count. Immutable — mutations return new instances.

```typescript
import { SearchIndex } from "./capabilities/search/domain/entities/search-index.entity";

const result = SearchIndex.create({
  id: crypto.randomUUID(),
  name: "posts",
});

if (result.isOk()) {
  const index = result.unwrap();
  console.log(index.documentCount); // 0
  const updated = index.incrementCount();
  console.log(updated.documentCount); // 1
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Index name (trimmed, non-empty) |
| `documentCount` | `number` | Number of documents (>= 0) |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

Methods: `incrementCount()` and `decrementCount()` return new instances with updated counts and timestamps.

### SearchQuery Value Object

```typescript
import { SearchQuery } from "./capabilities/search/domain/value-objects/search-query.vo";

const result = SearchQuery.create({
  query: "typescript backend",
  filters: { status: "published" },
  page: 1,
  pageSize: 20,
});
// Result<SearchQuery, InvalidQuery>
```

| Property | Type | Description |
|---|---|---|
| `query` | `string` | Trimmed, non-empty search term |
| `filters` | `Record<string, string \| string[]> \| undefined` | Optional field-level filters |
| `pagination` | `{ page: number, pageSize: number }` | Defaults: page 1, pageSize 10, max 100 |

Validation: query must be non-empty, page >= 1, pageSize capped at 100.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `IndexNotFound` | Index does not exist | `Search index not found: "<name>"` |
| `InvalidQuery` | Query is empty or invalid | `Invalid search query: <reason>` |
| `DocumentNotFound` | Document not in index | `Document not found with id: "<id>"` |

### Domain Events

| Event | Payload |
|---|---|
| `IndexUpdated` | `indexId`, `indexName`, `documentCount`, `occurredAt` |

## Application Layer

### Use Cases

#### IndexDocument

Adds or updates a document in a search index. If the index does not exist, the search engine creates it automatically.

```typescript
import { IndexDocument } from "./capabilities/search/application/use-cases/index-document.use-case";

const indexDocument = new IndexDocument(searchEngine);

const result = await indexDocument.execute({
  indexName: "posts",
  documentId: "post-123",
  document: { title: "My Post", content: "Hello world", authorId: "user-1" },
});
// Result<{ documentId, indexedAt }, Error>
```

**Possible failures**: `IndexNotFound`

#### SearchDocuments

Performs a full-text search with pagination and filters.

```typescript
const result = await searchDocuments.execute({
  indexName: "posts",
  query: "typescript",
  filters: { status: "published" },
  page: 1,
  pageSize: 20,
});
// Result<{ hits: SearchHit[], total, page, pageSize }, Error>
```

Each `SearchHit` contains `id`, `score`, and `document`.

**Possible failures**: `IndexNotFound`, `InvalidQuery`

#### RemoveFromIndex

Removes a document from a search index.

```typescript
const result = await removeFromIndex.execute({
  indexName: "posts",
  documentId: "post-123",
});
// Result<{ documentId, removedAt }, Error>
```

**Possible failures**: `IndexNotFound`, `DocumentNotFound`

### Port Interface

#### ISearchEngine

```typescript
export interface ISearchEngine {
  indexDocument(indexName: string, documentId: string, document: Record<string, unknown>): Promise<void>;
  search(params: {
    indexName: string;
    query: string;
    filters?: Record<string, string | string[]>;
    page: number;
    pageSize: number;
  }): Promise<{ hits: SearchHit[]; total: number }>;
  removeDocument(indexName: string, documentId: string): Promise<boolean>;
  indexExists(indexName: string): Promise<boolean>;
  documentExists(indexName: string, documentId: string): Promise<boolean>;
}
```

No registry adapter is provided — implement this port for your search provider (Meilisearch, Algolia, Typesense, PostgreSQL full-text, etc.).

## Public API (contracts/)

```typescript
import { createSearchService, ISearchService } from "./capabilities/search/contracts";

const searchService: ISearchService = createSearchService({
  searchEngine,
});

// ISearchService interface:
// indexDocument(input): Promise<Result<IndexDocumentOutput, Error>>
// searchDocuments(input): Promise<Result<SearchDocumentsOutput, Error>>
// removeFromIndex(input): Promise<Result<RemoveFromIndexOutput, Error>>
```

## Bridges

### blog-search

Automatically indexes blog posts when they are published via the `PostPublished` event.

```bash
npx @backcap/cli add blog-search
```

**Requires**: `blog` and `search` capabilities installed.

When a `PostPublished` event fires, the bridge calls `indexDocument` to add the post to the `"posts"` index with `title`, `slug`, `authorId`, and `publishedAt`.

## File Map

```
capabilities/search/
  domain/
    entities/search-index.entity.ts
    value-objects/search-query.vo.ts
    events/index-updated.event.ts
    errors/index-not-found.error.ts
    errors/invalid-query.error.ts
    errors/document-not-found.error.ts
  application/
    use-cases/index-document.use-case.ts
    use-cases/search-documents.use-case.ts
    use-cases/remove-from-index.use-case.ts
    ports/search-engine.port.ts
    dto/index-document.dto.ts
    dto/search-documents.dto.ts
    dto/remove-from-index.dto.ts
  contracts/
    search.contract.ts
    search.factory.ts
    index.ts
  shared/
    result.ts
```
