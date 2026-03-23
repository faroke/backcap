import { describe, it, expect, beforeEach } from "vitest";
import { UploadFile } from "../use-cases/upload-file.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";

describe("UploadFile use case", () => {
  let fileStorage: InMemoryFileStorage;
  let uploadFile: UploadFile;

  beforeEach(() => {
    fileStorage = new InMemoryFileStorage();
    uploadFile = new UploadFile(fileStorage);
  });

  it("uploads a file successfully", async () => {
    const result = await uploadFile.execute({
      name: "photo.jpg",
      path: "uploads/photo.jpg",
      mimeType: "image/jpeg",
      size: 2048,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.output.fileId).toBeDefined();
    expect(output.event.name).toBe("photo.jpg");
    expect(output.event.mimeType).toBe("image/jpeg");
    expect(output.event.size).toBe(2048);

    // Verify file was persisted
    const saved = await fileStorage.findById(output.output.fileId);
    expect(saved).not.toBeNull();
  });

  it("rejects invalid file path", async () => {
    const result = await uploadFile.execute({
      name: "photo.jpg",
      path: "",
      mimeType: "image/jpeg",
      size: 2048,
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects invalid file size", async () => {
    const result = await uploadFile.execute({
      name: "photo.jpg",
      path: "uploads/photo.jpg",
      mimeType: "image/jpeg",
      size: -1,
    });

    expect(result.isFail()).toBe(true);
  });
});
