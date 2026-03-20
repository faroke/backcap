import { Result } from "../../shared/result.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { IMediaStorage } from "../ports/media-storage.port.js";
import type { GetMediaUrlInput, GetMediaUrlOutput } from "../dto/get-media-url.dto.js";

export class GetMediaUrl {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly mediaStorage: IMediaStorage,
  ) {}

  async execute(input: GetMediaUrlInput): Promise<Result<GetMediaUrlOutput, MediaNotFound>> {
    const asset = await this.mediaRepository.findById(input.mediaId);
    if (!asset) {
      return Result.fail(MediaNotFound.create(input.mediaId));
    }

    if (input.purpose) {
      const variant = asset.variants.find((v) => v.purpose.value === input.purpose);
      if (variant) {
        const url = await this.mediaStorage.getUrl(variant.url);
        return Result.ok({ url });
      }
    }

    const url = await this.mediaStorage.getUrl(asset.originalUrl);
    return Result.ok({ url });
  }
}
