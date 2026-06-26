export interface ListFilesInput {
  limit?: number;
  offset?: number;
}

export interface ListFilesOutput {
  items: Array<{
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;
}
