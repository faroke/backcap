import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { detectConflicts } from "../../src/installer/conflict-detector.js";
import { ConflictDetectionError } from "../../src/errors/conflict-detection.error.js";

const mockReadFile = vi.mocked(readFile);

describe("detectConflicts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifies all files as new when none exist", async () => {
    const enoent = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockReadFile.mockRejectedValue(enoent);

    const report = await detectConflicts("/project/src/capabilities/auth", [
      { relativePath: "domain/user.entity.ts", content: "export class User {}" },
      { relativePath: "contracts/index.ts", content: "export {}" },
    ]);

    expect(report.hasConflicts).toBe(false);
    expect(report.files).toHaveLength(2);
    expect(report.files[0]!.status).toBe("new");
    expect(report.files[1]!.status).toBe("new");
  });

  it("classifies identical files correctly", async () => {
    const content = "export class User {}";
    mockReadFile.mockResolvedValue(content);

    const report = await detectConflicts("/project/src/capabilities/auth", [
      { relativePath: "domain/user.entity.ts", content },
    ]);

    expect(report.hasConflicts).toBe(false);
    expect(report.files[0]!.status).toBe("identical");
    expect(report.files[0]!.existingContent).toBe(content);
  });

  it("classifies modified files and sets hasConflicts", async () => {
    mockReadFile.mockResolvedValue("export class User { old() {} }");

    const report = await detectConflicts("/project/src/capabilities/auth", [
      { relativePath: "domain/user.entity.ts", content: "export class User { new() {} }" },
    ]);

    expect(report.hasConflicts).toBe(true);
    expect(report.files[0]!.status).toBe("modified");
    expect(report.files[0]!.existingContent).toBe("export class User { old() {} }");
    expect(report.files[0]!.incomingContent).toBe("export class User { new() {} }");
  });

  it("handles mixed statuses correctly", async () => {
    const enoent = Object.assign(new Error("ENOENT"), { code: "ENOENT" });

    mockReadFile.mockImplementation(async (path) => {
      const p = String(path);
      if (p.includes("user.entity.ts")) return "same content";
      if (p.includes("index.ts")) return "old barrel";
      throw enoent;
    });

    const report = await detectConflicts("/project/src/capabilities/auth", [
      { relativePath: "domain/user.entity.ts", content: "same content" },
      { relativePath: "contracts/index.ts", content: "new barrel" },
      { relativePath: "domain/new-file.ts", content: "brand new" },
    ]);

    expect(report.hasConflicts).toBe(true);
    expect(report.files[0]!.status).toBe("identical");
    expect(report.files[1]!.status).toBe("modified");
    expect(report.files[2]!.status).toBe("new");
  });

  it("reports all identical with no conflicts", async () => {
    mockReadFile.mockResolvedValue("content");

    const report = await detectConflicts("/project/src", [
      { relativePath: "a.ts", content: "content" },
      { relativePath: "b.ts", content: "content" },
    ]);

    expect(report.hasConflicts).toBe(false);
    expect(report.files.every((f) => f.status === "identical")).toBe(true);
  });

  it("throws ConflictDetectionError on path traversal", async () => {
    await expect(
      detectConflicts("/project/src/capabilities/auth", [
        { relativePath: "../../../etc/passwd", content: "malicious" },
      ]),
    ).rejects.toThrow(ConflictDetectionError);

    await expect(
      detectConflicts("/project/src/capabilities/auth", [
        { relativePath: "../../../etc/passwd", content: "malicious" },
      ]),
    ).rejects.toThrow(/Path traversal detected/);
  });

  it("throws ConflictDetectionError with suggestion on EACCES", async () => {
    const eacces = Object.assign(new Error("EACCES"), { code: "EACCES" });
    mockReadFile.mockRejectedValue(eacces);

    try {
      await detectConflicts("/project/src", [
        { relativePath: "locked.ts", content: "content" },
      ]);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictDetectionError);
      const error = err as ConflictDetectionError;
      expect(error.filePath).toBe("locked.ts");
      expect(error.suggestion).toContain("permissions");
    }
  });

  it("rethrows unknown fs errors as ConflictDetectionError", async () => {
    const unknownErr = Object.assign(new Error("EIO"), { code: "EIO" });
    mockReadFile.mockRejectedValue(unknownErr);

    await expect(
      detectConflicts("/project/src", [
        { relativePath: "broken.ts", content: "content" },
      ]),
    ).rejects.toThrow(ConflictDetectionError);
  });
});
