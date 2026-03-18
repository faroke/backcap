// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { UnsupportedFormat } from "../errors/unsupported-format.error.js";

export type MimeCategory = "image" | "video" | "document";

const SUPPORTED_MIME_TYPES: Record<string, MimeCategory> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "image/svg+xml": "image",
  "image/avif": "image",
  "image/tiff": "image",
  "image/bmp": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/ogg": "video",
  "video/quicktime": "video",
  "video/x-msvideo": "video",
  "application/pdf": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
};

export class MimeType {
  readonly value: string;
  readonly category: MimeCategory;

  private constructor(value: string, category: MimeCategory) {
    this.value = value;
    this.category = category;
  }

  static create(value: string): Result<MimeType, UnsupportedFormat> {
    const normalized = value.toLowerCase();
    const category = SUPPORTED_MIME_TYPES[normalized];
    if (!category) {
      return Result.fail(UnsupportedFormat.create(value));
    }
    return Result.ok(new MimeType(normalized, category));
  }

  isImage(): boolean {
    return this.category === "image";
  }

  isVideo(): boolean {
    return this.category === "video";
  }

  isDocument(): boolean {
    return this.category === "document";
  }

  equals(other: MimeType): boolean {
    return this.value === other.value;
  }
}
