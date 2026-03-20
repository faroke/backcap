import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
}));

import { readdir } from "node:fs/promises";
import { detectInstalledDomains } from "../../src/detection/installed.js";

const mockReaddir = vi.mocked(readdir);

describe("detectInstalledDomains", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns folder names from existing directory", async () => {
    mockReaddir.mockResolvedValue([
      { name: "auth", isDirectory: () => true, isFile: () => false },
      { name: "notifications", isDirectory: () => true, isFile: () => false },
      { name: "README.md", isDirectory: () => false, isFile: () => true },
    ] as any);

    const result = await detectInstalledDomains("/project/domains");

    expect(result).toEqual(["auth", "notifications"]);
    expect(mockReaddir).toHaveBeenCalledWith("/project/domains", { withFileTypes: true });
  });

  it("returns empty array for empty directory", async () => {
    mockReaddir.mockResolvedValue([]);

    const result = await detectInstalledDomains("/project/domains");

    expect(result).toEqual([]);
  });

  it("returns empty array when directory does not exist", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT: no such file or directory"));

    const result = await detectInstalledDomains("/project/domains");

    expect(result).toEqual([]);
  });
});
