import type { SearchHit } from "../dto/search-documents.dto.js";

export interface ISearchEngine {
  indexDocument(
    indexName: string,
    documentId: string,
    document: Record<string, unknown>,
  ): Promise<void>;

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
