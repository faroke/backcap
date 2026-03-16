// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { GetFileInput, GetFileOutput } from "../dto/get-file.dto.js";

export class GetFile {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(input: GetFileInput): Promise<Result<GetFileOutput, FileNotFound>> {
    const file = await this.fileStorage.findById(input.fileId);
    if (!file) {
      return Result.fail(FileNotFound.create(input.fileId));
    }

    return Result.ok({
      id: file.id,
      name: file.name,
      path: file.path.value,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: file.uploadedAt,
    });
  }
}
