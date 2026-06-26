import { describe, it, expect, beforeEach } from "vitest";
import { ProcessFile } from "../use-cases/process-file.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";
import { MockFileProcessor } from "./mocks/file-processor.mock.js";
import { createTestFile } from "./fixtures/file.fixture.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";
import { ProcessingFailed } from "../../domain/errors/processing-failed.error.js";

describe("ProcessFile use case", () => {
  let fileStorage: InMemoryFileStorage;
  let fileProcessor: MockFileProcessor;
  let processFile: ProcessFile;

  beforeEach(() => {
    fileStorage = new InMemoryFileStorage();
    fileProcessor = new MockFileProcessor();
    processFile = new ProcessFile(fileStorage, fileProcessor);
  });

  it("generates variants for an existing file", async () => {
    const file = createTestFile();
    await fileStorage.save(file);

    const result = await processFile.execute({
      fileId: file.id,
      variants: [
        { purpose: "thumbnail", width: 150, height: 150, format: "jpeg" },
        { purpose: "preview", width: 800, height: 600, format: "jpeg" },
      ],
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.output.variantCount).toBe(2);
    expect(output.event.variantCount).toBe(2);

    const updated = await fileStorage.findById(file.id);
    expect(updated!.variants).toHaveLength(2);
  });

  it("uses convert when format differs from source", async () => {
    const file = createTestFile({ mimeType: "image/jpeg" });
    await fileStorage.save(file);

    let convertCalled = false;
    fileProcessor.convert = async (inputUrl, format) => {
      convertCalled = true;
      return { url: `${inputUrl}.${format}`, width: 1920, height: 1080, format };
    };

    const result = await processFile.execute({
      fileId: file.id,
      variants: [
        { purpose: "optimized", width: 1920, height: 1080, format: "webp" },
      ],
    });

    expect(result.isOk()).toBe(true);
    expect(convertCalled).toBe(true);
  });

  it("rejects empty variants array", async () => {
    const file = createTestFile();
    await fileStorage.save(file);

    const result = await processFile.execute({
      fileId: file.id,
      variants: [],
    });

    expect(result.isFail()).toBe(true);
  });

  it("fails when file not found", async () => {
    const result = await processFile.execute({
      fileId: "nonexistent",
      variants: [{ purpose: "thumbnail", width: 150, height: 150, format: "jpeg" }],
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileNotFound);
  });

  it("fails when processor throws", async () => {
    const file = createTestFile();
    await fileStorage.save(file);

    fileProcessor.resize = async () => {
      throw new Error("Processing error");
    };

    const result = await processFile.execute({
      fileId: file.id,
      variants: [{ purpose: "preview", width: 800, height: 600, format: "jpeg" }],
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ProcessingFailed);
  });
});
