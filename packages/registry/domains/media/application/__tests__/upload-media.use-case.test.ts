import { describe, it, expect, beforeEach } from "vitest";
import { UploadMedia } from "../use-cases/upload-media.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";

describe("UploadMedia use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let uploadMedia: UploadMedia;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    uploadMedia = new UploadMedia(mediaRepository);
  });

  it("uploads media successfully", async () => {
    const result = await uploadMedia.execute({
      name: "photo.jpg",
      originalUrl: "uploads/photo.jpg",
      mimeType: "image/jpeg",
      size: 2048,
      width: 1920,
      height: 1080,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.output.mediaId).toBeDefined();
    expect(output.event.name).toBe("photo.jpg");
    expect(output.event.mimeType).toBe("image/jpeg");
    expect(output.event.size).toBe(2048);

    const saved = await mediaRepository.findById(output.output.mediaId);
    expect(saved).not.toBeNull();
    expect(saved!.mimeType.isImage()).toBe(true);
  });

  it("uploads media without dimensions", async () => {
    const result = await uploadMedia.execute({
      name: "doc.pdf",
      originalUrl: "uploads/doc.pdf",
      mimeType: "application/pdf",
      size: 4096,
    });

    expect(result.isOk()).toBe(true);
    const saved = await mediaRepository.findById(result.unwrap().output.mediaId);
    expect(saved!.dimensions).toBeNull();
  });

  it("rejects unsupported MIME type", async () => {
    const result = await uploadMedia.execute({
      name: "file.xyz",
      originalUrl: "uploads/file.xyz",
      mimeType: "application/x-unknown",
      size: 1024,
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid size", async () => {
    const result = await uploadMedia.execute({
      name: "photo.jpg",
      originalUrl: "uploads/photo.jpg",
      mimeType: "image/jpeg",
      size: -1,
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects empty originalUrl", async () => {
    const result = await uploadMedia.execute({
      name: "photo.jpg",
      originalUrl: "",
      mimeType: "image/jpeg",
      size: 2048,
    });

    expect(result.isFail()).toBe(true);
  });
});
