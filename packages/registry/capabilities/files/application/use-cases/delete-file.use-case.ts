// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { DeleteFileInput } from "../dto/delete-file.dto.js";

export class DeleteFile {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(input: DeleteFileInput): Promise<Result<void, FileNotFound>> {
    const file = await this.fileStorage.findById(input.fileId);
    if (!file) {
      return Result.fail(FileNotFound.create(input.fileId));
    }

    await this.fileStorage.delete(input.fileId);

    return Result.ok(undefined);
  }
}
