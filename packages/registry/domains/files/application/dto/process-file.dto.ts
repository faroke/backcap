export interface ProcessFileInput {
  fileId: string;
  variants: Array<{
    purpose: string;
    width: number;
    height: number;
    format: string;
  }>;
}

export interface ProcessFileOutput {
  fileId: string;
  variantCount: number;
}
