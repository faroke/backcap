import type { ISearchEngine } from "../../ports/search-engine.port.js";
import type { SearchHit } from "../../dto/search-documents.dto.js";

interface StoredDocument {
  documentId: string;
  document: Record<string, unknown>;
}

export class InMemorySearchEngine implements ISearchEngine {
  private indexes = new Map<string, Map<string, Record<string, unknown>>>();

  createIndex(indexName: string): void {
    if (!this.indexes.has(indexName)) {
      this.indexes.set(indexName, new Map());
    }
  }

  async indexExists(indexName: string): Promise<boolean> {
    return this.indexes.has(indexName);
  }

  async documentExists(indexName: string, documentId: string): Promise<boolean> {
    const index = this.indexes.get(indexName);
    if (!index) return false;
    return index.has(documentId);
  }

  async indexDocument(
    indexName: string,
    documentId: string,
    document: Record<string, unknown>,
  ): Promise<void> {
    let index = this.indexes.get(indexName);
    if (!index) {
      index = new Map();
      this.indexes.set(indexName, index);
    }
    index.set(documentId, document);
  }

  async search(params: {
    indexName: string;
    query: string;
    filters?: Record<string, string | string[]>;
    page: number;
    pageSize: number;
  }): Promise<{ hits: SearchHit[]; total: number }> {
    const index = this.indexes.get(params.indexName);
    if (!index) {
      return { hits: [], total: 0 };
    }

    const queryLower = params.query.toLowerCase();
    const allDocs: StoredDocument[] = [...index.entries()].map(
      ([documentId, document]) => ({ documentId, document }),
    );

    const matched = allDocs.filter(({ document }) => {
      const docStr = JSON.stringify(document).toLowerCase();
      return docStr.includes(queryLower);
    });

    const total = matched.length;
    const start = (params.page - 1) * params.pageSize;
    const paginated = matched.slice(start, start + params.pageSize);

    const hits: SearchHit[] = paginated.map(({ documentId, document }, i) => ({
      id: documentId,
      score: 1.0 - i * 0.01,
      document,
    }));

    return { hits, total };
  }

  async removeDocument(indexName: string, documentId: string): Promise<boolean> {
    const index = this.indexes.get(indexName);
    if (!index) return false;
    return index.delete(documentId);
  }

  getDocumentCount(indexName: string): number {
    return this.indexes.get(indexName)?.size ?? 0;
  }
}
