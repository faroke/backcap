export interface UploadMediaInput {
  name: string;
  originalUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadMediaOutput {
  mediaId: string;
}
