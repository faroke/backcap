// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { GetMediaInput, GetMediaOutput } from "../dto/get-media.dto.js";

export class GetMedia {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async execute(input: GetMediaInput): Promise<Result<GetMediaOutput, MediaNotFound>> {
    const asset = await this.mediaRepository.findById(input.mediaId);
    if (!asset) {
      return Result.fail(MediaNotFound.create(input.mediaId));
    }

    return Result.ok({
      id: asset.id,
      originalUrl: asset.originalUrl,
      mimeType: asset.mimeType.value,
      width: asset.dimensions?.width ?? null,
      height: asset.dimensions?.height ?? null,
      size: asset.size,
      variants: asset.variants.map((v) => ({
        id: v.id,
        url: v.url,
        width: v.width,
        height: v.height,
        format: v.format,
        purpose: v.purpose.value,
      })),
      uploadedAt: asset.uploadedAt,
    });
  }
}
