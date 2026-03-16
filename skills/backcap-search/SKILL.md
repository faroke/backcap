---
name: backcap-search
description: >
  Backcap search capability: DDD-structured full-text search for TypeScript backends.
  Domain layer contains SearchIndex entity, SearchQuery value object, and three typed errors
  (IndexNotFound, DocumentNotFound, InvalidQuery). Application layer has IndexDocument,
  SearchDocuments, and RemoveFromIndex use cases, plus ISearchEngine port interface.
  Public surface is ISearchService and createSearchService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Event: IndexUpdated.
  Bridge: blog-search indexes posts from blog capability. Zero npm dependencies in domain
  and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-search

The `search` capability provides **full-text search indexing and querying** for TypeScript
backends. It is structured in strict Clean Architecture layers and has zero npm dependencies
in the domain and application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

See [`references/domain-map.md`](references/domain-map.md) for a full file-by-file reference.

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/search-index.entity.ts` | `SearchIndex` | Represents a named search index. Private constructor; factory via `SearchIndex.create(params)`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/search-query.vo.ts` | `SearchQuery` | Validates query (non-empty), pagination (page >= 1, pageSize capped at 100). `SearchQuery.create(params)` returns `Result<SearchQuery, InvalidQuery>`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/index-not-found.error.ts` | `IndexNotFound` | `Index not found: "<name>"` |
| `domain/errors/document-not-found.error.ts` | `DocumentNotFound` | `Document not found with id: "<id>"` |
| `domain/errors/invalid-query.error.ts` | `InvalidQuery` | `Invalid search query: <reason>` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/index-updated.event.ts` | `IndexUpdated` | `indexName`, `documentId`, `action`, `occurredAt` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/search-engine.port.ts` | `ISearchEngine` | `indexDocument(indexName, docId, doc)`, `search(params)`, `removeDocument(indexName, docId)`, `indexExists(indexName)`, `documentExists(indexName, docId)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/index-document.dto.ts` | `IndexDocumentInput` | `indexName`, `documentId`, `document` |
| `application/dto/index-document.dto.ts` | `IndexDocumentOutput` | `documentId`, `indexedAt` |
| `application/dto/search-documents.dto.ts` | `SearchDocumentsInput` | `indexName`, `query`, `filters?`, `page?`, `pageSize?` |
| `application/dto/search-documents.dto.ts` | `SearchDocumentsOutput` | `hits[]`, `total`, `page`, `pageSize` |
| `application/dto/search-documents.dto.ts` | `SearchHit` | `id`, `score`, `document` |
| `application/dto/remove-from-index.dto.ts` | `RemoveFromIndexInput` | `indexName`, `documentId` |
| `application/dto/remove-from-index.dto.ts` | `RemoveFromIndexOutput` | `documentId`, `removedAt` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/index-document.use-case.ts` | `IndexDocument` | `Result<IndexDocumentOutput, Error>` |
| `application/use-cases/search-documents.use-case.ts` | `SearchDocuments` | `Result<SearchDocumentsOutput, Error>` |
| `application/use-cases/remove-from-index.use-case.ts` | `RemoveFromIndex` | `Result<RemoveFromIndexOutput, Error>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/search.contract.ts` | `ISearchService`, DTO re-exports | The only public interface consumers depend on |
| `contracts/search.factory.ts` | `createSearchService(deps): ISearchService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

## Extension Guide

See [`references/extension-guide.md`](references/extension-guide.md) for step-by-step
instructions on adding use cases, entities, and DTOs.

### Quick summary

- **New use case**: add to `application/use-cases/`, declare new ports if needed, wire into
  `contracts/search.factory.ts`, expose types from `contracts/index.ts`.
- **New entity / VO**: add to `domain/entities/` or `domain/value-objects/`, private constructor,
  `static create` returning `Result`.

## Conventions

See [`references/patterns.md`](references/patterns.md) for search-specific patterns.

Search-specific rules:
- The `ISearchEngine` port abstracts the search backend (Meilisearch, Algolia, Elasticsearch, etc.).
- `SearchQuery` value object validates and normalizes query input before passing to the engine.
- Page size is capped at 100 to prevent excessive result sets.
- `IndexDocument` use case checks index existence before indexing.
- `RemoveFromIndex` validates both index and document existence before removal.

## Available Bridges

| Bridge | Description | Install |
|---|---|---|
| `blog-search` | Indexes published blog posts for full-text search | `npx @backcap/cli add bridge blog-search` |

See [`references/bridges.md`](references/bridges.md) for detailed bridge documentation.

## CLI Commands

| Command | Description |
|---|---|
| `npx @backcap/cli init` | Scaffold `backcap.json` in the current project |
| `npx @backcap/cli list` | List all available capabilities from the registry |
| `npx @backcap/cli add search` | Install the search capability (prompts for adapter selection) |
| `npx @backcap/cli bridges` | List bridges compatible with installed capabilities |
