import { Result } from "../../shared/result.js";
import { MediaVariant } from "../../domain/entities/media-variant.entity.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import { ProcessingFailed } from "../../domain/errors/processing-failed.error.js";
import { MediaProcessed } from "../../domain/events/media-processed.event.js";
import type { IMediaRepository } from "../ports/media-repository.port.js";
import type { IMediaProcessor } from "../ports/media-processor.port.js";
import type { ProcessMediaInput, ProcessMediaOutput } from "../dto/process-media.dto.js";

export class ProcessMedia {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly mediaProcessor: IMediaProcessor,
  ) {}

  async execute(
    input: ProcessMediaInput,
  ): Promise<Result<{ output: ProcessMediaOutput; event: MediaProcessed }, MediaNotFound | ProcessingFailed | Error>> {
    const asset = await this.mediaRepository.findById(input.mediaId);
    if (!asset) {
      return Result.fail(MediaNotFound.create(input.mediaId));
    }

    if (input.variants.length === 0) {
      return Result.fail(
        new Error("At least one variant spec must be provided"),
      );
    }

    const variants: MediaVariant[] = [];
    for (const spec of input.variants) {
      let processed;
      try {
        if (spec.purpose === "thumbnail") {
          processed = await this.mediaProcessor.generateThumbnail(
            asset.originalUrl,
            Math.min(spec.width, spec.height),
          );
        } else if (spec.purpose === "optimized" || this.needsConversion(asset.mimeType.value, spec.format)) {
          processed = await this.mediaProcessor.convert(
            asset.originalUrl,
            spec.format,
          );
        } else {
          processed = await this.mediaProcessor.resize(
            asset.originalUrl,
            spec.width,
            spec.height,
          );
        }
      } catch (err) {
        return Result.fail(
          ProcessingFailed.create(input.mediaId, err instanceof Error ? err.message : "Unknown error"),
        );
      }

      const variantResult = MediaVariant.create({
        id: crypto.randomUUID(),
        url: processed.url,
        width: processed.width,
        height: processed.height,
        format: processed.format,
        purpose: spec.purpose,
      });

      if (variantResult.isFail()) {
        return Result.fail(variantResult.unwrapError());
      }

      variants.push(variantResult.unwrap());
    }

    const updatedAsset = asset.withVariants([...asset.variants, ...variants]);
    await this.mediaRepository.save(updatedAsset);

    const event = new MediaProcessed(updatedAsset.id, variants.length);

    return Result.ok({
      output: { mediaId: updatedAsset.id, variantCount: variants.length },
      event,
    });
  }

  private needsConversion(currentMimeType: string, targetFormat: string): boolean {
    const mimeToFormat: Record<string, string> = {
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/avif": "avif",
      "video/mp4": "mp4",
      "video/webm": "webm",
    };
    const currentFormat = mimeToFormat[currentMimeType];
    return currentFormat !== undefined && currentFormat !== targetFormat;
  }
}
