export interface IndexDocumentInput {
  indexName: string;
  documentId: string;
  document: Record<string, unknown>;
}

export interface IndexDocumentOutput {
  documentId: string;
  indexedAt: Date;
}
