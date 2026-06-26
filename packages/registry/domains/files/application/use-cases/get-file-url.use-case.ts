import { Result } from "../../shared/result.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { GetFileUrlInput, GetFileUrlOutput } from "../dto/get-file-url.dto.js";

export class GetFileUrl {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(input: GetFileUrlInput): Promise<Result<GetFileUrlOutput, FileNotFound>> {
    const file = await this.fileStorage.findById(input.fileId);
    if (!file) {
      return Result.fail(FileNotFound.create(input.fileId));
    }

    if (input.purpose) {
      const variant = file.variants.find((v) => v.purpose.value === input.purpose);
      if (variant) {
        const url = await this.fileStorage.getUrl(variant.url);
        return Result.ok({ url });
      }
    }

    const key = file.originalUrl ?? file.path.value;
    const url = await this.fileStorage.getUrl(key);
    return Result.ok({ url });
  }
}
