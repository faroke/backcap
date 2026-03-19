export interface SearchDocumentsInput {
  indexName: string;
  query: string;
  filters?: Record<string, string | string[]>;
  page?: number;
  pageSize?: number;
}

export interface SearchHit {
  id: string;
  score: number;
  document: Record<string, unknown>;
}

export interface SearchDocumentsOutput {
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
}
