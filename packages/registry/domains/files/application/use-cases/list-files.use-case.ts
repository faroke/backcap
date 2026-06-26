import { Result } from "../../shared/result.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { ListFilesInput, ListFilesOutput } from "../dto/list-files.dto.js";

export class ListFiles {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(input: ListFilesInput): Promise<Result<ListFilesOutput, never>> {
    const files = await this.fileStorage.findAll({
      limit: input.limit,
      offset: input.offset,
    });

    return Result.ok({
      items: files.map((file) => ({
        id: file.id,
        name: file.name,
        path: file.path.value,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt,
      })),
    });
  }
}
