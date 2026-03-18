export interface ProcessMediaInput {
  mediaId: string;
  variants: Array<{
    purpose: string;
    width: number;
    height: number;
    format: string;
  }>;
}

export interface ProcessMediaOutput {
  mediaId: string;
  variantCount: number;
}
