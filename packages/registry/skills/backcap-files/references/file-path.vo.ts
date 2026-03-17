// Reference copy of capabilities/files/domain/value-objects/file-path.vo.ts
// For skill documentation purposes — source of truth is the capability itself.

import { Result } from "../../shared/result.js";
import { InvalidFilePath } from "../errors/invalid-file-path.error.js";

const SAFE_PATH_REGEX = /^[a-zA-Z0-9._\-][a-zA-Z0-9._\-/]*$/;

export class FilePath {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<FilePath, InvalidFilePath> {
    if (!value || value.trim().length === 0) {
      return Result.fail(InvalidFilePath.create(value));
    }

    if (value.includes("..")) {
      return Result.fail(InvalidFilePath.create(value));
    }

    if (!SAFE_PATH_REGEX.test(value)) {
      return Result.fail(InvalidFilePath.create(value));
    }

    return Result.ok(new FilePath(value));
  }
}
