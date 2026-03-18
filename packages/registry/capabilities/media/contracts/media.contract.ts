import type { Result } from "../shared/result.js";
import type { UploadMediaInput, UploadMediaOutput } from "../application/dto/upload-media.dto.js";
import type { ProcessMediaInput, ProcessMediaOutput } from "../application/dto/process-media.dto.js";
import type { GetMediaInput, GetMediaOutput } from "../application/dto/get-media.dto.js";
import type { ListMediaInput, ListMediaOutput } from "../application/dto/list-media.dto.js";
import type { DeleteMediaInput } from "../application/dto/delete-media.dto.js";
import type { GetMediaUrlInput, GetMediaUrlOutput } from "../application/dto/get-media-url.dto.js";
import type { MediaUploaded } from "../domain/events/media-uploaded.event.js";
import type { MediaProcessed } from "../domain/events/media-processed.event.js";
import type { MediaDeleted } from "../domain/events/media-deleted.event.js";

export type {
  UploadMediaInput,
  UploadMediaOutput,
  ProcessMediaInput,
  ProcessMediaOutput,
  GetMediaInput,
  GetMediaOutput,
  ListMediaInput,
  ListMediaOutput,
  DeleteMediaInput,
  GetMediaUrlInput,
  GetMediaUrlOutput,
  MediaUploaded,
  MediaProcessed,
  MediaDeleted,
};

export interface IMediaService {
  upload(input: UploadMediaInput): Promise<Result<{ output: UploadMediaOutput; event: MediaUploaded }, Error>>;
  process(input: ProcessMediaInput): Promise<Result<{ output: ProcessMediaOutput; event: MediaProcessed }, Error>>;
  get(input: GetMediaInput): Promise<Result<GetMediaOutput, Error>>;
  list(input: ListMediaInput): Promise<Result<ListMediaOutput, Error>>;
  delete(input: DeleteMediaInput): Promise<Result<{ event: MediaDeleted }, Error>>;
  getUrl(input: GetMediaUrlInput): Promise<Result<GetMediaUrlOutput, Error>>;
}
