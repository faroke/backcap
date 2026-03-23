import { Result } from "../../shared/result.js";
import { File } from "../../domain/entities/file.entity.js";
import { FileUploaded } from "../../domain/events/file-uploaded.event.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { UploadFileInput, UploadFileOutput } from "../dto/upload-file.dto.js";

export class UploadFile {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(
    input: UploadFileInput,
  ): Promise<Result<{ output: UploadFileOutput; event: FileUploaded }, Error>> {
    const id = crypto.randomUUID();
    const fileResult = File.create({
      id,
      name: input.name,
      path: input.path,
      mimeType: input.mimeType,
      size: input.size,
    });

    if (fileResult.isFail()) {
      return Result.fail(fileResult.unwrapError());
    }

    const file = fileResult.unwrap();
    await this.fileStorage.save(file);

    const event = new FileUploaded(file.id, file.name, file.mimeType, file.size);

    return Result.ok({ output: { fileId: file.id }, event });
  }
}
