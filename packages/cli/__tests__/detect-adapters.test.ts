import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("pkg-types", () => ({
  readPackageJSON: vi.fn(),
}));

import { readPackageJSON } from "pkg-types";
import { detectAdapters } from "../src/lib/detect-adapters.js";

const mockReadPkg = vi.mocked(readPackageJSON);

describe("detectAdapters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects prisma and express adapters", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { "@prisma/client": "^5.0", express: "^4.0" },
    } as any);

    const result = await detectAdapters("/fake", "auth");
    expect(result).toEqual([
      { name: "auth-prisma", category: "persistence", detected: true },
      { name: "auth-express", category: "http", detected: true },
    ]);
  });

  it("detects only prisma when express is missing", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { "@prisma/client": "^5.0" },
    } as any);

    const result = await detectAdapters("/fake", "auth");
    expect(result.map((a) => a.name)).toEqual(["auth-prisma"]);
  });

  it("returns empty when no packages match", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { lodash: "^4.0" },
    } as any);

    const result = await detectAdapters("/fake", "auth");
    expect(result).toEqual([]);
  });

  it("returns empty when readPackageJSON fails", async () => {
    mockReadPkg.mockRejectedValue(new Error("ENOENT"));
    const result = await detectAdapters("/fake", "auth");
    expect(result).toEqual([]);
  });

  it("uses capability name for adapter naming", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { "@prisma/client": "^5.0" },
    } as any);

    const result = await detectAdapters("/fake", "blog");
    expect(result[0]!.name).toBe("blog-prisma");
  });
});
