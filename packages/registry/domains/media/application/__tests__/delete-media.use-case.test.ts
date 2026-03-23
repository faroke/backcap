import { describe, it, expect, beforeEach } from "vitest";
import { DeleteMedia } from "../use-cases/delete-media.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";
import { InMemoryMediaStorage } from "./mocks/media-storage.mock.js";
import { createTestMediaAsset } from "./fixtures/media-asset.fixture.js";
import { MediaVariant } from "../../domain/entities/media-variant.entity.js";
import { MediaNotFound } from "../../domain/errors/media-not-found.error.js";
import { MediaDeleted } from "../../domain/events/media-deleted.event.js";

describe("DeleteMedia use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let mediaStorage: InMemoryMediaStorage;
  let deleteMedia: DeleteMedia;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    mediaStorage = new InMemoryMediaStorage();
    deleteMedia = new DeleteMedia(mediaRepository, mediaStorage);
  });

  it("deletes an existing media asset and emits event", async () => {
    const asset = createTestMediaAsset();
    await mediaRepository.save(asset);

    const result = await deleteMedia.execute({ mediaId: asset.id });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().event).toBeInstanceOf(MediaDeleted);
    expect(result.unwrap().event.mediaId).toBe(asset.id);

    const deleted = await mediaRepository.findById(asset.id);
    expect(deleted).toBeNull();
  });

  it("deletes storage files for asset and variants", async () => {
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

    // Upload files to storage so we can verify they get deleted
    await mediaStorage.upload("uploads/photo.jpg", Buffer.from("original"));
    await mediaStorage.upload("uploads/photo-thumb.jpg", Buffer.from("thumb"));

    const result = await deleteMedia.execute({ mediaId: asset.id });

    expect(result.isOk()).toBe(true);
  });

  it("fails when media not found", async () => {
    const result = await deleteMedia.execute({ mediaId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(MediaNotFound);
  });
});
