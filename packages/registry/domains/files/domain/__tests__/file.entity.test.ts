import { describe, it, expect } from "vitest";
import { File } from "../entities/file.entity.js";
import { InvalidFilePath } from "../errors/invalid-file-path.error.js";
import { FileTooLarge } from "../errors/file-too-large.error.js";

describe("File entity", () => {
  const validParams = {
    id: "file-1",
    name: "document.pdf",
    path: "uploads/documents/document.pdf",
    mimeType: "application/pdf",
    size: 1024,
  };

  it("creates a valid file", () => {
    const result = File.create(validParams);
    expect(result.isOk()).toBe(true);
    const file = result.unwrap();
    expect(file.id).toBe("file-1");
    expect(file.name).toBe("document.pdf");
    expect(file.path.value).toBe("uploads/documents/document.pdf");
    expect(file.mimeType).toBe("application/pdf");
    expect(file.size).toBe(1024);
    expect(file.uploadedAt).toBeInstanceOf(Date);
  });

  it("creates a file with a custom uploadedAt", () => {
    const uploadedAt = new Date("2024-01-01T00:00:00.000Z");
    const result = File.create({ ...validParams, uploadedAt });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().uploadedAt).toBe(uploadedAt);
  });

  it("fails with invalid path containing path traversal", () => {
    const result = File.create({ ...validParams, path: "../etc/passwd" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("fails with empty path", () => {
    const result = File.create({ ...validParams, path: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("fails with zero size", () => {
    const result = File.create({ ...validParams, size: 0 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileTooLarge);
  });

  it("fails with negative size", () => {
    const result = File.create({ ...validParams, size: -1 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileTooLarge);
  });

  it("fails with non-integer size", () => {
    const result = File.create({ ...validParams, size: 1.5 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileTooLarge);
  });
});
