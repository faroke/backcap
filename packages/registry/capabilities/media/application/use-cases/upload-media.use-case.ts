// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MediaAsset } from "../../domain/entities/media-asset.entity.js";
import { MediaUploaded } from "../../domain/events/media-uploaded.event.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { UploadMediaInput, UploadMediaOutput } from "../dto/upload-media.dto.js";

export class UploadMedia {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async execute(
    input: UploadMediaInput,
  ): Promise<Result<{ output: UploadMediaOutput; event: MediaUploaded }, Error>> {
    const id = crypto.randomUUID();
    const assetResult = MediaAsset.create({
      id,
      originalUrl: input.originalUrl,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      size: input.size,
    });

    if (assetResult.isFail()) {
      return Result.fail(assetResult.unwrapError());
    }

    const asset = assetResult.unwrap();
    await this.mediaRepository.save(asset);

    const event = new MediaUploaded(asset.id, input.name, asset.mimeType.value, asset.size);

    return Result.ok({ output: { mediaId: asset.id }, event });
  }
}
