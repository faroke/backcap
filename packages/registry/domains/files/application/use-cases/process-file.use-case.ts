import { Result } from "../../shared/result.js";
import { FileVariant } from "../../domain/entities/file-variant.entity.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";
import { ProcessingFailed } from "../../domain/errors/processing-failed.error.js";
import { NoVariantsSpecified } from "../../domain/errors/no-variants-specified.error.js";
import { FileProcessed } from "../../domain/events/file-processed.event.js";
import type { IFileStorage } from "../ports/file-storage.port.js";
import type { IFileProcessor } from "../ports/file-processor.port.js";
import type { ProcessFileInput, ProcessFileOutput } from "../dto/process-file.dto.js";
import type { InvalidDimensions } from "../../domain/errors/invalid-dimensions.error.js";
import type { InvalidMediaPurpose } from "../../domain/errors/invalid-media-purpose.error.js";
import type { InvalidVariant } from "../../domain/errors/invalid-variant.error.js";

export class ProcessFile {
  constructor(
    private readonly fileStorage: IFileStorage,
    private readonly fileProcessor: IFileProcessor,
  ) {}

  async execute(
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
  > {
    const file = await this.fileStorage.findById(input.fileId);
    if (!file) {
      return Result.fail(FileNotFound.create(input.fileId));
    }

    if (input.variants.length === 0) {
      return Result.fail(NoVariantsSpecified.create());
    }

    const sourceUrl = file.originalUrl ?? file.path.value;
    const variants: FileVariant[] = [];

    for (const spec of input.variants) {
      let processed;
      try {
        if (spec.purpose === "thumbnail") {
          processed = await this.fileProcessor.generateThumbnail(
            sourceUrl,
            Math.min(spec.width, spec.height),
          );
        } else if (spec.purpose === "optimized" || this.needsConversion(file.mimeType, spec.format)) {
          processed = await this.fileProcessor.convert(
            sourceUrl,
            spec.format,
          );
        } else {
          processed = await this.fileProcessor.resize(
            sourceUrl,
            spec.width,
            spec.height,
          );
        }
      } catch (err) {
        return Result.fail(
          ProcessingFailed.create(input.fileId, err instanceof Error ? err.message : "Unknown error"),
        );
      }

      const variantResult = FileVariant.create({
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

    const updatedFile = file.withVariants([...file.variants, ...variants]);
    await this.fileStorage.save(updatedFile);

    const event = new FileProcessed(updatedFile.id, variants.length);

    return Result.ok({
      output: { fileId: updatedFile.id, variantCount: variants.length },
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
