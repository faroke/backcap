import { describe, it, expect, beforeEach } from "vitest";
import { GetMediaUrl } from "../use-cases/get-media-url.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";
import { InMemoryMediaStorage } from "./mocks/media-storage.mock.js";
import { createTestMediaAsset } from "./fixtures/media-asset.fixture.js";
import { MediaVariant } from "../../domain/entities/media-variant.entity.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";

describe("GetMediaUrl use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let mediaStorage: InMemoryMediaStorage;
  let getMediaUrl: GetMediaUrl;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    mediaStorage = new InMemoryMediaStorage();
    getMediaUrl = new GetMediaUrl(mediaRepository, mediaStorage);
  });

  it("returns CDN URL for original asset", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await getMediaUrl.execute({ mediaId: asset.id });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/photo.jpg");
  });

  it("returns CDN URL for a specific variant purpose", async () => {
    const variant = MediaVariant.create({
      id: "var-1",
      url: "uploads/photo-thumb.jpg",
      width: 150,
      height: 150,
      format: "jpeg",
      purpose: "thumbnail",
    }).unwrap();

    const asset = createTestMediaAsset().addVariant(variant);
    await mediaRepository.save(asset);

    const result = await getMediaUrl.execute({ mediaId: asset.id, purpose: "thumbnail" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/photo-thumb.jpg");
  });

  it("falls back to original URL when purpose variant not found", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await getMediaUrl.execute({ mediaId: asset.id, purpose: "thumbnail" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/photo.jpg");
  });

  it("fails when media not found", async () => {
    const result = await getMediaUrl.execute({ mediaId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MediaNotFound);
  });
});
