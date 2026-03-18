import type { IMediaProcessor, ProcessedOutput } from "../../ports/media-processor.port.js";

export class MockMediaProcessor implements IMediaProcessor {
  async resize(inputUrl: string, width: number, height: number): Promise<ProcessedOutput> {
    return {
      url: `${inputUrl}-${width}x${height}`,
      width,
      height,
      format: "jpeg",
    };
  }

  async convert(inputUrl: string, format: string): Promise<ProcessedOutput> {
    return {
      url: `${inputUrl}.${format}`,
      width: 800,
      height: 600,
      format,
    };
  }

  async generateThumbnail(inputUrl: string, size: number): Promise<ProcessedOutput> {
    return {
      url: `${inputUrl}-thumb-${size}`,
      width: size,
      height: size,
      format: "jpeg",
    };
  }
}
