import { describe, it, expect, beforeEach } from "vitest";
import { DeleteFile } from "../use-cases/delete-file.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";
import { createTestFile } from "./fixtures/file.fixture.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";

describe("DeleteFile use case", () => {
  let fileStorage: InMemoryFileStorage;
  let deleteFile: DeleteFile;

  beforeEach(async () => {
    fileStorage = new InMemoryFileStorage();
    deleteFile = new DeleteFile(fileStorage);

    const file = createTestFile({ id: "file-1" });
    await fileStorage.save(file);
  });

  it("deletes a file successfully", async () => {
    const result = await deleteFile.execute({ fileId: "file-1" });

    expect(result.isOk()).toBe(true);

    const deleted = await fileStorage.findById("file-1");
    expect(deleted).toBeNull();
  });

  it("fails when file not found", async () => {
    const result = await deleteFile.execute({ fileId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileNotFound);
  });
});
