// Reference copy of capabilities/files/domain/entities/file.entity.ts
// For skill documentation purposes — source of truth is the capability itself.

import { Result } from "../../shared/result.js";
import { FilePath } from "../value-objects/file-path.vo.js";
import { InvalidFilePath } from "../errors/invalid-file-path.error.js";
import { FileTooLarge } from "../errors/file-too-large.error.js";

export class File {
  readonly id: string;
  readonly name: string;
  readonly path: FilePath;
  readonly mimeType: string;
  readonly size: number;
  readonly uploadedAt: Date;

  private constructor(
    id: string,
    name: string,
    path: FilePath,
    mimeType: string,
    size: number,
    uploadedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.path = path;
    this.mimeType = mimeType;
    this.size = size;
    this.uploadedAt = uploadedAt;
  }

  static create(params: {
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
    uploadedAt?: Date;
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
      ),
    );
  }
}
