import { Result } from "../../shared/result.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import { MediaDeleted } from "../../domain/events/media-deleted.event.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { IMediaStorage } from "../ports/media-storage.port.js";
import type { DeleteMediaInput } from "../dto/delete-media.dto.js";

export class DeleteMedia {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly mediaStorage: IMediaStorage,
  ) {}

  async execute(
    input: DeleteMediaInput,
  ): Promise<Result<{ event: MediaDeleted }, MediaNotFound>> {
    const asset = await this.mediaRepository.findById(input.mediaId);
    if (!asset) {
      return Result.fail(MediaNotFound.create(input.mediaId));
    }

    // Delete variant files from storage
    for (const variant of asset.variants) {
      await this.mediaStorage.delete(variant.url);
    }
    // Delete original file from storage
    await this.mediaStorage.delete(asset.originalUrl);

    await this.mediaRepository.delete(input.mediaId);

    const event = new MediaDeleted(asset.id);

    return Result.ok({ event });
  }
}
