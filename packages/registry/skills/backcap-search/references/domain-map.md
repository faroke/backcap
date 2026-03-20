# Search Capability — Domain Map

Complete file-by-file reference for the `search` capability.

---

## Directory Tree

```
domains/search/
  domain/
    entities/
      search-index.entity.ts
    value-objects/
      search-query.vo.ts
    errors/
      index-not-found.error.ts
      document-not-found.error.ts
      invalid-query.error.ts
    events/
      index-updated.event.ts
    __tests__/
      search-index.entity.test.ts
      search-query.vo.test.ts
  application/
    use-cases/
      index-document.use-case.ts
      search-documents.use-case.ts
      remove-from-index.use-case.ts
    ports/
      search-engine.port.ts
    dto/
      index-document.dto.ts
      search-documents.dto.ts
      remove-from-index.dto.ts
    __tests__/
      index-document.use-case.test.ts
      search-documents.use-case.test.ts
      remove-from-index.use-case.test.ts
      mocks/
        search-engine.mock.ts
  contracts/
    search.contract.ts
    search.factory.ts
    index.ts
  shared/
    result.ts
```

---

## Domain Layer

### `domain/entities/search-index.entity.ts`

**Export**: `SearchIndex`

Represents a named search index with configuration.

---

### `domain/value-objects/search-query.vo.ts`

**Export**: `SearchQuery`

Validates and normalizes search queries:

```typescript
class SearchQuery {
  readonly query: string
  readonly filters: Record<string, string | string[]> | undefined
  readonly pagination: { page: number; pageSize: number }

  static create(params: {
    query: string
    filters?: Record<string, string | string[]>
    page?: number
    pageSize?: number
  }): Result<SearchQuery, InvalidQuery>
}
```

Validation rules:
- Query must not be empty (after trimming).
- Page must be >= 1.
- Page size is capped at 100.

---

### `domain/errors/index-not-found.error.ts`

**Export**: `IndexNotFound extends Error`

```typescript
static create(indexName: string): IndexNotFound
```

---

### `domain/errors/document-not-found.error.ts`

**Export**: `DocumentNotFound extends Error`

```typescript
static create(documentId: string): DocumentNotFound
```

---

### `domain/errors/invalid-query.error.ts`

**Export**: `InvalidQuery extends Error`

```typescript
static create(reason: string): InvalidQuery
```

---

## Application Layer

### `application/ports/search-engine.port.ts`

**Export**: `ISearchEngine`

```typescript
interface ISearchEngine {
  indexDocument(indexName: string, documentId: string, document: Record<string, unknown>): Promise<void>
  search(params: {
    indexName: string; query: string;
    filters?: Record<string, string | string[]>;
    page: number; pageSize: number;
  }): Promise<{ hits: SearchHit[]; total: number }>
  removeDocument(indexName: string, documentId: string): Promise<boolean>
  indexExists(indexName: string): Promise<boolean>
  documentExists(indexName: string, documentId: string): Promise<boolean>
}
```

---

### `application/use-cases/index-document.use-case.ts`

**Export**: `IndexDocument`

Indexes a document into a named index. Checks index existence first.

---

### `application/use-cases/search-documents.use-case.ts`

**Export**: `SearchDocuments`

Validates query via `SearchQuery.create()`, checks index existence, executes search.

---

### `application/use-cases/remove-from-index.use-case.ts`

**Export**: `RemoveFromIndex`

Validates index and document existence before removal.

---

## Contracts Layer

### `contracts/search.contract.ts`

```typescript
interface ISearchService {
  indexDocument(input: IndexDocumentInput): Promise<Result<IndexDocumentOutput, Error>>
  searchDocuments(input: SearchDocumentsInput): Promise<Result<SearchDocumentsOutput, Error>>
  removeFromIndex(input: RemoveFromIndexInput): Promise<Result<RemoveFromIndexOutput, Error>>
}
```

### `contracts/search.factory.ts`

```typescript
type SearchServiceDeps = { searchEngine: ISearchEngine }
function createSearchService(deps: SearchServiceDeps): ISearchService
```
