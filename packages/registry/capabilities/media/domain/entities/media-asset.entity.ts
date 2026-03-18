// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MimeType } from "../value-objects/mime-type.vo.js";
import { Dimensions } from "../value-objects/dimensions.vo.js";
import { UnsupportedFormat } from "../errors/unsupported-format.error.js";
import { FileTooLarge } from "../errors/file-too-large.error.js";
import type { MediaVariant } from "./media-variant.entity.js";

export class MediaAsset {
  readonly id: string;
  readonly originalUrl: string;
  readonly mimeType: MimeType;
  readonly dimensions: Dimensions | null;
  readonly size: number;
  readonly variants: ReadonlyArray<MediaVariant>;
  readonly uploadedAt: Date;

  private constructor(
    id: string,
    originalUrl: string,
    mimeType: MimeType,
    dimensions: Dimensions | null,
    size: number,
    variants: ReadonlyArray<MediaVariant>,
    uploadedAt: Date,
  ) {
    this.id = id;
    this.originalUrl = originalUrl;
    this.mimeType = mimeType;
    this.dimensions = dimensions;
    this.size = size;
    this.variants = variants;
    this.uploadedAt = uploadedAt;
  }

  static create(params: {
    id: string;
    originalUrl: string;
    mimeType: string;
    width?: number;
    height?: number;
    size: number;
    maxSize?: number;
    variants?: ReadonlyArray<MediaVariant>;
    uploadedAt?: Date;
  }): Result<MediaAsset, UnsupportedFormat | FileTooLarge | Error> {
    if (!Number.isInteger(params.size) || params.size <= 0) {
      return Result.fail(
        new Error(`File size must be a positive integer, got: ${params.size}`),
      );
    }

    if (params.maxSize !== undefined && params.size > params.maxSize) {
      return Result.fail(FileTooLarge.create(params.size, params.maxSize));
    }

    const mimeTypeResult = MimeType.create(params.mimeType);
    if (mimeTypeResult.isFail()) {
      return Result.fail(mimeTypeResult.unwrapError());
    }

    const hasWidth = params.width !== undefined;
    const hasHeight = params.height !== undefined;
    if (hasWidth !== hasHeight) {
      return Result.fail(
        new Error("Both width and height must be provided together, or neither"),
      );
    }

    let dimensions: Dimensions | null = null;
    if (hasWidth && hasHeight) {
      const dimResult = Dimensions.create(params.width!, params.height!);
      if (dimResult.isFail()) {
        return Result.fail(dimResult.unwrapError());
      }
      dimensions = dimResult.unwrap();
    }

    if (!params.originalUrl || params.originalUrl.trim().length === 0) {
      return Result.fail(new Error("Original URL cannot be empty"));
    }

    return Result.ok(
      new MediaAsset(
        params.id,
        params.originalUrl,
        mimeTypeResult.unwrap(),
        dimensions,
        params.size,
        params.variants ?? [],
        params.uploadedAt ?? new Date(),
      ),
    );
  }

  withVariants(variants: ReadonlyArray<MediaVariant>): MediaAsset {
    return new MediaAsset(
      this.id,
      this.originalUrl,
      this.mimeType,
      this.dimensions,
      this.size,
      variants,
      this.uploadedAt,
    );
  }

  addVariant(variant: MediaVariant): MediaAsset {
    return this.withVariants([...this.variants, variant]);
  }
}
