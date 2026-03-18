export interface GetMediaInput {
  mediaId: string;
}

export interface GetMediaOutput {
  id: string;
  originalUrl: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  variants: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
    format: string;
    purpose: string;
  }>;
  uploadedAt: Date;
}
