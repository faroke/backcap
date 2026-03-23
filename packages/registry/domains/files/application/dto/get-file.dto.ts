export interface GetFileInput {
  fileId: string;
}

export interface GetFileOutput {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}
