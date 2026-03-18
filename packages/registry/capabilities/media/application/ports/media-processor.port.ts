export interface ProcessedOutput {
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface IMediaProcessor {
  resize(inputUrl: string, width: number, height: number): Promise<ProcessedOutput>;
  convert(inputUrl: string, format: string): Promise<ProcessedOutput>;
  generateThumbnail(inputUrl: string, size: number): Promise<ProcessedOutput>;
}
