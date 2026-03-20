import { Result } from "../../shared/result.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { ListMediaInput, ListMediaOutput } from "../dto/list-media.dto.js";

export class ListMedia {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async execute(input: ListMediaInput): Promise<Result<ListMediaOutput, Error>> {
    const assets = await this.mediaRepository.findAll({
      limit: input.limit,
      offset: input.offset,
    });

    return Result.ok({
      items: assets.map((asset) => ({
        id: asset.id,
        originalUrl: asset.originalUrl,
        mimeType: asset.mimeType.value,
        size: asset.size,
        uploadedAt: asset.uploadedAt,
      })),
    });
  }
}
