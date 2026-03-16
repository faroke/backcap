import { describe, it, expect } from "vitest";
import { FilePath } from "../value-objects/file-path.vo.js";
import { InvalidFilePath } from "../errors/invalid-file-path.error.js";

describe("FilePath VO", () => {
  it("creates a valid simple path", () => {
    const result = FilePath.create("uploads/file.pdf");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("uploads/file.pdf");
  });

  it("creates a valid nested path", () => {
    const result = FilePath.create("users/123/documents/report.pdf");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("users/123/documents/report.pdf");
  });

  it("creates a valid path with hyphens and underscores", () => {
    const result = FilePath.create("my-folder/my_file.txt");
    expect(result.isOk()).toBe(true);
  });

  it("rejects empty string", () => {
    const result = FilePath.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("rejects path with double dot traversal", () => {
    const result = FilePath.create("../etc/passwd");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("rejects path with embedded traversal", () => {
    const result = FilePath.create("uploads/../secret/data");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("rejects path with special shell characters", () => {
    const result = FilePath.create("uploads/file;rm -rf /");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidFilePath);
  });

  it("is immutable (readonly value)", () => {
    const filePath = FilePath.create("uploads/file.pdf").unwrap();
    expect(filePath.value).toBe("uploads/file.pdf");
  });
});
