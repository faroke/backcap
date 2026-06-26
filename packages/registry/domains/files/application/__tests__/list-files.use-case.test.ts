import { describe, it, expect, beforeEach } from "vitest";
import { ListFiles } from "../use-cases/list-files.use-case.js";
import { InMemoryFileStorage } from "./mocks/file-storage.mock.js";
import { createTestFile } from "./fixtures/file.fixture.js";

describe("ListFiles use case", () => {
  let fileStorage: InMemoryFileStorage;
  let listFiles: ListFiles;

  beforeEach(() => {
    fileStorage = new InMemoryFileStorage();
    listFiles = new ListFiles(fileStorage);
  });

  it("lists all files", async () => {
    await fileStorage.save(createTestFile({ id: "f1", path: "uploads/f1.pdf" }));
    await fileStorage.save(createTestFile({ id: "f2", path: "uploads/f2.pdf" }));

    const result = await listFiles.execute({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(2);
  });

  it("returns empty list when no files exist", async () => {
    const result = await listFiles.execute({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(0);
  });

  it("supports pagination with limit and offset", async () => {
    await fileStorage.save(createTestFile({ id: "f1", path: "uploads/f1.pdf" }));
    await fileStorage.save(createTestFile({ id: "f2", path: "uploads/f2.pdf" }));
    await fileStorage.save(createTestFile({ id: "f3", path: "uploads/f3.pdf" }));

    const result = await listFiles.execute({ limit: 2, offset: 1 });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(2);
  });
});
