import { describe, it, expect, beforeEach } from "vitest";
import { GetFile } from "../use-cases/get-file.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";
import { createTestFile } from "./fixtures/file.fixture.js";
import { FileNotFound } from "../../domain/errors/file-not-found.error.js";

describe("GetFile use case", () => {
  let fileStorage: InMemoryFileStorage;
  let getFile: GetFile;

  beforeEach(async () => {
    fileStorage = new InMemoryFileStorage();
    getFile = new GetFile(fileStorage);

    const file = createTestFile({ id: "file-1", name: "doc.pdf" });
    await fileStorage.save(file);
  });

  it("returns a file by id", async () => {
    const result = await getFile.execute({ fileId: "file-1" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.id).toBe("file-1");
    expect(output.name).toBe("doc.pdf");
  });

  it("fails when file not found", async () => {
    const result = await getFile.execute({ fileId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileNotFound);
  });
});
