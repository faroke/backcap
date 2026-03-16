---
title: Search Capability
description: Full-text search for TypeScript backends — coming soon.
---

The `search` capability will provide full-text search for TypeScript backends. It will follow the same four-layer Clean Architecture used by all Backcap capabilities, with a provider-agnostic port interface that allows you to plug in Meilisearch, Algolia, Typesense, or a database-native solution.

## Status

This capability is on the roadmap. It is not yet available in the registry.

## Planned Features

- Index documents from any capability (posts, products, users)
- Full-text search with relevance ranking
- Faceted filtering by arbitrary fields
- Pagination support
- Provider-agnostic: one port interface, multiple adapters

## Planned Domain Model

### SearchQuery Value Object

```typescript
// Planned API
const query = SearchQuery.create({
  term: "typescript backend",
  filters: { status: "published" },
  page: 1,
  pageSize: 20,
});
```

### SearchResult

```typescript
interface SearchResult<T> {
  hits: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Planned Domain Errors

| Error | Condition |
|---|---|
| `InvalidSearchQuery` | Query term is empty or exceeds length limits |
| `IndexNotFound` | The requested search index does not exist |
| `SearchProviderError` | The search provider returned an unexpected error |

### Planned Use Cases

| Use Case | Description |
|---|---|
| `Search` | Performs a full-text search query against an index |
| `IndexDocument` | Adds or updates a document in the search index |
| `DeleteDocument` | Removes a document from the index by ID |
| `RebuildIndex` | Re-indexes all documents (typically a background job) |

## Planned Port Interface

```typescript
// Planned
export interface ISearchProvider {
  search<T>(index: string, query: SearchQuery): Promise<SearchResult<T>>;
  index(index: string, id: string, document: Record<string, unknown>): Promise<void>;
  delete(index: string, id: string): Promise<void>;
}
```

## Planned Adapters

- **search-meilisearch**: Adapter using the Meilisearch JavaScript SDK
- **search-typesense**: Adapter using the Typesense JavaScript SDK
- **search-postgres**: Adapter using PostgreSQL's `tsvector` and `tsquery` via Prisma raw queries

## Planned Bridges

- **blog-search**: Indexes blog posts when they are published (`PostPublished` event)
- **search-auth**: Excludes unpublished content based on the requesting user's roles

## Stay Updated

Watch the [Backcap GitHub repository](https://github.com/backcap/backcap) for progress on the search capability.

If you need search today, you can follow the [Create a Capability guide](/guides/create-capability) to build your own using the same patterns.
