import type { IMediaRepository } from "../application/ports/media-repository.port.js";
import type { IMediaProcessor } from "../application/ports/media-processor.port.js";
import type { IMediaStorage } from "../application/ports/media-storage.port.js";
import { UploadMedia } from "../application/use-cases/upload-media.use-case.js";
import { ProcessMedia } from "../application/use-cases/process-media.use-case.js";
import { GetMedia } from "../application/use-cases/get-media.use-case.js";
import { ListMedia } from "../application/use-cases/list-media.use-case.js";
import { DeleteMedia } from "../application/use-cases/delete-media.use-case.js";
import { GetMediaUrl } from "../application/use-cases/get-media-url.use-case.js";
import type { IMediaService } from "./media.contract.js";

export type MediaServiceDeps = {
  mediaRepository: IMediaRepository;
  mediaProcessor: IMediaProcessor;
  mediaStorage: IMediaStorage;
};

export function createMediaService(deps: MediaServiceDeps): IMediaService {
  const uploadMedia = new UploadMedia(deps.mediaRepository);
  const processMedia = new ProcessMedia(deps.mediaRepository, deps.mediaProcessor);
  const getMedia = new GetMedia(deps.mediaRepository);
  const listMedia = new ListMedia(deps.mediaRepository);
  const deleteMedia = new DeleteMedia(deps.mediaRepository, deps.mediaStorage);
  const getMediaUrl = new GetMediaUrl(deps.mediaRepository, deps.mediaStorage);

  return {
    upload: (input) => uploadMedia.execute(input),
    process: (input) => processMedia.execute(input),
    get: (input) => getMedia.execute(input),
    list: (input) => listMedia.execute(input),
    delete: (input) => deleteMedia.execute(input),
    getUrl: (input) => getMediaUrl.execute(input),
  };
}
