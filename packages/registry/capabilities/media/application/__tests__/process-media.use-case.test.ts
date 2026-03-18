import { describe, it, expect, beforeEach } from "vitest";
import { ProcessMedia } from "../use-cases/process-media.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";
import { MockMediaProcessor } from "./mocks/media-processor.mock.js";
import { createTestMediaAsset } from "./fixtures/media-asset.fixture.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import { ProcessingFailed } from "../../domain/errors/processing-failed.error.js";

describe("ProcessMedia use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let mediaProcessor: MockMediaProcessor;
  let processMedia: ProcessMedia;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    mediaProcessor = new MockMediaProcessor();
    processMedia = new ProcessMedia(mediaRepository, mediaProcessor);
  });

  it("generates variants for an existing asset", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await processMedia.execute({
      mediaId: asset.id,
      variants: [
        { purpose: "thumbnail", width: 150, height: 150, format: "jpeg" },
        { purpose: "preview", width: 800, height: 600, format: "jpeg" },
      ],
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.output.variantCount).toBe(2);
    expect(output.event.variantCount).toBe(2);

    const updated = await mediaRepository.findById(asset.id);
    expect(updated!.variants).toHaveLength(2);
  });

  it("uses convert when format differs from source", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    let convertCalled = false;
    mediaProcessor.convert = async (inputUrl, format) => {
      convertCalled = true;
      return { url: `${inputUrl}.${format}`, width: 1920, height: 1080, format };
    };

    const result = await processMedia.execute({
      mediaId: asset.id,
      variants: [
        { purpose: "optimized", width: 1920, height: 1080, format: "webp" },
      ],
    });

    expect(result.isOk()).toBe(true);
    expect(convertCalled).toBe(true);
  });

  it("rejects empty variants array", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await processMedia.execute({
      mediaId: asset.id,
      variants: [],
    });

    expect(result.isFail()).toBe(true);
  });

  it("fails when media not found", async () => {
    const result = await processMedia.execute({
      mediaId: "nonexistent",
      variants: [{ purpose: "thumbnail", width: 150, height: 150, format: "jpeg" }],
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MediaNotFound);
  });

  it("fails when processor throws", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    mediaProcessor.resize = async () => {
      throw new Error("Processing error");
    };

    const result = await processMedia.execute({
      mediaId: asset.id,
      variants: [{ purpose: "preview", width: 800, height: 600, format: "jpeg" }],
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProcessingFailed);
  });
});
