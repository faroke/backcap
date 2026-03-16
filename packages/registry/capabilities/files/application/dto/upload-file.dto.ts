export interface UploadFileInput {
  name: string;
  path: string;
  mimeType: string;
  size: number;
}

export interface UploadFileOutput {
  fileId: string;
}
