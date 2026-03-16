export interface RemoveFromIndexInput {
  indexName: string;
  documentId: string;
}

export interface RemoveFromIndexOutput {
  documentId: string;
  removedAt: Date;
}
