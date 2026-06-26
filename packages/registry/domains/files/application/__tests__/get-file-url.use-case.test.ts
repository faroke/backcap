import { describe, it, expect, beforeEach } from "vitest";
import { GetFileUrl } from "../use-cases/get-file-url.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";
import { createTestFile } from "./fixtures/file.fixture.js";
import { FileVariant } from "../../domain/entities/file-variant.entity.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";

describe("GetFileUrl use case", () => {
  let fileStorage: InMemoryFileStorage;
  let getFileUrl: GetFileUrl;

  beforeEach(() => {
    fileStorage = new InMemoryFileStorage();
    getFileUrl = new GetFileUrl(fileStorage);
  });

  it("returns CDN URL for original file", async () => {
    const file = createTestFile();
    await fileStorage.save(file);

    const result = await getFileUrl.execute({ fileId: file.id });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/document.pdf");
  });

  it("returns CDN URL for a specific variant purpose", async () => {
    const variant = FileVariant.create({
      id: "var-1",
      url: "uploads/photo-thumb.jpg",
      width: 150,
      height: 150,
      format: "jpeg",
      purpose: "thumbnail",
    }).unwrap();

    const file = createTestFile().addVariant(variant);
    await fileStorage.save(file);

    const result = await getFileUrl.execute({ fileId: file.id, purpose: "thumbnail" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/photo-thumb.jpg");
  });

  it("falls back to original URL when purpose variant not found", async () => {
    const file = createTestFile();
    await fileStorage.save(file);

    const result = await getFileUrl.execute({ fileId: file.id, purpose: "thumbnail" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().url).toBe("https://cdn.example.com/uploads/document.pdf");
  });

  it("fails when file not found", async () => {
    const result = await getFileUrl.execute({ fileId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileNotFound);
  });
});
