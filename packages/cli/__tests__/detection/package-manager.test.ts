import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectPackageManager } from "../../src/detection/package-manager.js";

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
}));

import { stat } from "node:fs/promises";
const mockStat = vi.mocked(stat);

function statFound() {
  return Promise.resolve({} as any);
}

function statNotFound() {
  return Promise.reject(new Error("ENOENT"));
}

describe("detectPackageManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStat.mockImplementation(() => statNotFound());
  });

  it("detects npm via package-lock.json", async () => {
    mockStat.mockImplementation((path) =>
      String(path).includes("package-lock.json") ? statFound() : statNotFound(),
    );
    const result = await detectPackageManager("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("npm");
  });

  it("detects pnpm via pnpm-lock.yaml", async () => {
    mockStat.mockImplementation((path) =>
      String(path).includes("pnpm-lock.yaml") ? statFound() : statNotFound(),
    );
    const result = await detectPackageManager("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("pnpm");
  });

  it("detects yarn via yarn.lock", async () => {
    mockStat.mockImplementation((path) =>
      String(path).includes("yarn.lock") ? statFound() : statNotFound(),
    );
    const result = await detectPackageManager("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("yarn");
  });

  it("detects bun via bun.lockb", async () => {
    mockStat.mockImplementation((path) =>
      String(path).includes("bun.lockb") ? statFound() : statNotFound(),
    );
    const result = await detectPackageManager("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("bun");
  });

  it("returns fail when no lockfile found", async () => {
    const result = await detectPackageManager("/fake");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().field).toBe("packageManager");
  });

  it("respects priority (bun > pnpm when both present)", async () => {
    mockStat.mockImplementation((path) => {
      const p = String(path);
      return p.includes("bun.lockb") || p.includes("pnpm-lock.yaml")
        ? statFound()
        : statNotFound();
    });
    const result = await detectPackageManager("/fake");
    expect(result.unwrap()).toBe("bun");
  });
});
