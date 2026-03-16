/**
 * In-memory implementation of ISearchEngine for demo purposes.
 * Replace with a Meilisearch/Algolia/Typesense adapter for production.
 */
export interface SearchHit {
  id: string;
  score: number;
  document: Record<string, unknown>;
}

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

export class InMemorySearchEngine implements ISearchEngine {
  private indices = new Map<string, Map<string, Record<string, unknown>>>();

  constructor(indexNames: string[] = []) {
    for (const name of indexNames) {
      this.indices.set(name, new Map());
    }
  }

  async indexDocument(indexName: string, documentId: string, document: Record<string, unknown>): Promise<void> {
    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, new Map());
    }
    this.indices.get(indexName)!.set(documentId, document);
  }

  async search(params: {
    indexName: string;
    query: string;
    filters?: Record<string, string | string[]>;
    page: number;
    pageSize: number;
  }): Promise<{ hits: SearchHit[]; total: number }> {
    const index = this.indices.get(params.indexName);
    if (!index) return { hits: [], total: 0 };

    const queryLower = params.query.toLowerCase();
    const allHits: SearchHit[] = [];

    for (const [id, doc] of index) {
      const text = JSON.stringify(doc).toLowerCase();
      if (text.includes(queryLower)) {
        allHits.push({ id, score: 1.0, document: doc });
      }
    }

    const start = (params.page - 1) * params.pageSize;
    const hits = allHits.slice(start, start + params.pageSize);

    return { hits, total: allHits.length };
  }

  async removeDocument(indexName: string, documentId: string): Promise<boolean> {
    const index = this.indices.get(indexName);
    if (!index) return false;
    return index.delete(documentId);
  }

  async indexExists(indexName: string): Promise<boolean> {
    return this.indices.has(indexName);
  }

  async documentExists(indexName: string, documentId: string): Promise<boolean> {
    return this.indices.get(indexName)?.has(documentId) ?? false;
  }

  getDocumentCount(indexName: string): number {
    return this.indices.get(indexName)?.size ?? 0;
  }
}
