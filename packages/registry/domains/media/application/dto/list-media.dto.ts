export interface ListMediaInput {
  limit?: number;
  offset?: number;
}

export interface ListMediaOutput {
  items: Array<{
    id: string;
    originalUrl: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;
}
