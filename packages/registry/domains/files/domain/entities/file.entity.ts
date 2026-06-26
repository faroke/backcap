import { Result } from "../../shared/result.js";
import { FilePath } from "../value-objects/file-path.vo.js";
import { InvalidFilePath } from "../errors/invalid-file-path.error.js";
import { FileTooLarge } from "../errors/file-too-large.error.js";
import type { Dimensions } from "../value-objects/dimensions.vo.js";
import type { FileVariant } from "./file-variant.entity.js";

export class File {
  readonly id: string;
  readonly name: string;
  readonly path: FilePath;
  readonly mimeType: string;
  readonly size: number;
  readonly uploadedAt: Date;
  readonly originalUrl: string | null;
  readonly dimensions: Dimensions | null;
  readonly variants: ReadonlyArray<FileVariant>;

  private constructor(
    id: string,
    name: string,
    path: FilePath,
    mimeType: string,
    size: number,
    uploadedAt: Date,
    originalUrl: string | null,
    dimensions: Dimensions | null,
    variants: ReadonlyArray<FileVariant>,
  ) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.mimeType = mimeType;
    this.size = size;
    this.uploadedAt = uploadedAt;
    this.originalUrl = originalUrl;
    this.dimensions = dimensions;
    this.variants = variants;
  }

  static create(params: {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    uploadedAt?: Date;
    originalUrl?: string;
    dimensions?: Dimensions;
    variants?: ReadonlyArray<FileVariant>;
  }): Result<File, InvalidFilePath | FileTooLarge> {
    if (!Number.isInteger(params.size) || params.size <= 0) {
      return Result.fail(
        new FileTooLarge(`File size must be a positive integer, got: ${params.size}`),
      );
    }

    const pathResult = FilePath.create(params.path);
    if (pathResult.isFail()) {
      return Result.fail(pathResult.unwrapError());
    }

    return Result.ok(
      new File(
        params.id,
        params.name,
        pathResult.unwrap(),
        params.mimeType,
        params.size,
        params.uploadedAt ?? new Date(),
        params.originalUrl ?? null,
        params.dimensions ?? null,
        params.variants ?? [],
      ),
    );
  }

  withVariants(variants: ReadonlyArray<FileVariant>): File {
    return new File(
      this.id,
      this.name,
      this.path,
      this.mimeType,
      this.size,
      this.uploadedAt,
      this.originalUrl,
      this.dimensions,
      variants,
    );
  }

  addVariant(variant: FileVariant): File {
    return this.withVariants([...this.variants, variant]);
  }
}
