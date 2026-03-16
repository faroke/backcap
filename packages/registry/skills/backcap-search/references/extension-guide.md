# Search Capability — Extension Guide

Step-by-step instructions for extending the `search` capability.

---

## Adding a New Use Case

### Example: `CreateIndex`

**Step 1 — Define a DTO**

```typescript
// application/dto/create-index.dto.ts
export interface CreateIndexInput {
  indexName: string;
  settings?: Record<string, unknown>;
}

export interface CreateIndexOutput {
  indexName: string;
  createdAt: Date;
}
```

**Step 2 — Extend the port if needed**

Add `createIndex(indexName: string, settings?: Record<string, unknown>): Promise<void>` to
`ISearchEngine`.

**Step 3 — Write the use case**

```typescript
// application/use-cases/create-index.use-case.ts
import { Result } from '../../shared/result.js';
import type { ISearchEngine } from '../ports/search-engine.port.js';
import type { CreateIndexInput, CreateIndexOutput } from '../dto/create-index.dto.js';

export class CreateIndex {
  constructor(private readonly searchEngine: ISearchEngine) {}

  async execute(input: CreateIndexInput): Promise<Result<CreateIndexOutput, Error>> {
    await this.searchEngine.createIndex(input.indexName, input.settings);
    return Result.ok({ indexName: input.indexName, createdAt: new Date() });
  }
}
```

**Step 4 — Wire into factory and contract**

Add `createIndex` to `ISearchService` and `createSearchService`.

**Step 5 — Write a test**

Use `InMemorySearchEngine` mock, which already has a `createIndex()` helper method.

---

## Adding a New Search Engine Adapter

Implement the `ISearchEngine` port for your chosen backend:

```typescript
// adapters/meilisearch/search-engine.adapter.ts
import type { ISearchEngine } from '../../application/ports/search-engine.port.js';

export class MeilisearchEngine implements ISearchEngine {
  constructor(private readonly client: MeiliSearch) {}

  async indexDocument(indexName, documentId, document) {
    await this.client.index(indexName).addDocuments([{ id: documentId, ...document }]);
  }

  async search(params) {
    const result = await this.client.index(params.indexName).search(params.query, {
      filter: params.filters,
      offset: (params.page - 1) * params.pageSize,
      limit: params.pageSize,
    });
    return {
      hits: result.hits.map(h => ({ id: h.id, score: 1, document: h })),
      total: result.estimatedTotalHits,
    };
  }

  // ... implement remaining methods
}
```
