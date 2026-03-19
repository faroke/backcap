import type { ISearchEngine } from "../capabilities/search/application/ports/search-engine.port.js";
import type { SearchHit } from "../capabilities/search/application/dto/search-documents.dto.js";

export class InMemorySearchEngine implements ISearchEngine {
  private indices = new Map<string, Map<string, Record<string, unknown>>>();

  async indexDocument(
    indexName: string,
    documentId: string,
    document: Record<string, unknown>,
  ): Promise<void> {
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

    const query = params.query.toLowerCase();
    const hits: SearchHit[] = [];

    for (const [id, doc] of index) {
      const text = JSON.stringify(doc).toLowerCase();
      if (text.includes(query)) {
        hits.push({ id, score: 1, document: doc });
      }
    }

    const start = (params.page - 1) * params.pageSize;
    return {
      hits: hits.slice(start, start + params.pageSize),
      total: hits.length,
    };
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
}
