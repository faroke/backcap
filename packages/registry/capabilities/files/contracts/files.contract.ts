import type { Result } from "../shared/result.js";
import type { UploadFileInput, UploadFileOutput } from "../application/dto/upload-file.dto.js";
import type { GetFileInput, GetFileOutput } from "../application/dto/get-file.dto.js";
import type { DeleteFileInput } from "../application/dto/delete-file.dto.js";

export type { UploadFileInput, UploadFileOutput, GetFileInput, GetFileOutput, DeleteFileInput };

export interface IFilesService {
  upload(input: UploadFileInput): Promise<Result<UploadFileOutput, Error>>;
  get(input: GetFileInput): Promise<Result<GetFileOutput, Error>>;
  delete(input: DeleteFileInput): Promise<Result<void, Error>>;
}
