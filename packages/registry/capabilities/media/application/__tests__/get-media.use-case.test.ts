import { describe, it, expect, beforeEach } from "vitest";
import { GetMedia } from "../use-cases/get-media.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";
import { createTestMediaAsset } from "./fixtures/media-asset.fixture.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";

describe("GetMedia use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let getMedia: GetMedia;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    getMedia = new GetMedia(mediaRepository);
  });

  it("returns media asset by id", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await getMedia.execute({ mediaId: asset.id });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.id).toBe(asset.id);
    expect(output.originalUrl).toBe("uploads/photo.jpg");
    expect(output.mimeType).toBe("image/jpeg");
    expect(output.width).toBe(1920);
    expect(output.height).toBe(1080);
    expect(output.size).toBe(2048);
    expect(output.variants).toHaveLength(0);
  });

  it("fails when media not found", async () => {
    const result = await getMedia.execute({ mediaId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MediaNotFound);
  });
});
