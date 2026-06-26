import type { Result } from "../shared/result.js";
import type { UploadFileInput, UploadFileOutput } from "../application/dto/upload-file.dto.js";
import type { GetFileInput, GetFileOutput } from "../application/dto/get-file.dto.js";
import type { DeleteFileInput } from "../application/dto/delete-file.dto.js";
import type { ProcessFileInput, ProcessFileOutput } from "../application/dto/process-file.dto.js";
import type { ListFilesInput, ListFilesOutput } from "../application/dto/list-files.dto.js";
import type { GetFileUrlInput, GetFileUrlOutput } from "../application/dto/get-file-url.dto.js";
import type { FileUploaded } from "../domain/events/file-uploaded.event.js";
import type { FileProcessed } from "../domain/events/file-processed.event.js";
import type { FileDeleted } from "../domain/events/file-deleted.event.js";
import type { InvalidFilePath } from "../domain/errors/invalid-file-path.error.js";
import type { FileTooLarge } from "../domain/errors/file-too-large.error.js";
import type { FileNotFound } from "../domain/errors/file-not-found.error.js";
import type { ProcessingFailed } from "../domain/errors/processing-failed.error.js";
import type { NoVariantsSpecified } from "../domain/errors/no-variants-specified.error.js";
import type { InvalidDimensions } from "../domain/errors/invalid-dimensions.error.js";
import type { InvalidMediaPurpose } from "../domain/errors/invalid-media-purpose.error.js";
import type { InvalidVariant } from "../domain/errors/invalid-variant.error.js";

export type {
  UploadFileInput,
  UploadFileOutput,
  GetFileInput,
  GetFileOutput,
  DeleteFileInput,
  ProcessFileInput,
  ProcessFileOutput,
  ListFilesInput,
  ListFilesOutput,
  GetFileUrlInput,
  GetFileUrlOutput,
  FileUploaded,
  FileProcessed,
  FileDeleted,
};

export interface IFilesService {
  upload(input: UploadFileInput): Promise<Result<UploadFileOutput, InvalidFilePath | FileTooLarge>>;
  get(input: GetFileInput): Promise<Result<GetFileOutput, FileNotFound>>;
  delete(input: DeleteFileInput): Promise<Result<void, FileNotFound>>;
  process(
    input: ProcessFileInput,
  ): Promise<
    Result<
      { output: ProcessFileOutput; event: FileProcessed },
      | FileNotFound
      | NoVariantsSpecified
      | ProcessingFailed
      | InvalidDimensions
      | InvalidMediaPurpose
      | InvalidVariant
    >
  >;
  list(input: ListFilesInput): Promise<Result<ListFilesOutput, never>>;
  getUrl(input: GetFileUrlInput): Promise<Result<GetFileUrlOutput, FileNotFound>>;
}
