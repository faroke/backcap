import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { stat } from "node:fs/promises";
import { directoryExists } from "../src/lib/conflict-check.js";

const mockStat = vi.mocked(stat);

describe("directoryExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when directory exists", async () => {
    mockStat.mockResolvedValue({ isDirectory: () => true } as any);
    expect(await directoryExists("/fake/dir")).toBe(true);
  });

  it("returns false when path is a file", async () => {
    mockStat.mockResolvedValue({ isDirectory: () => false } as any);
    expect(await directoryExists("/fake/file")).toBe(false);
  });

  it("returns false when path does not exist", async () => {
    mockStat.mockRejectedValue(new Error("ENOENT"));
    expect(await directoryExists("/nonexistent")).toBe(false);
  });
});
