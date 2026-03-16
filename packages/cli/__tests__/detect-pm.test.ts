import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

import { existsSync } from "node:fs";
import { detectPM, buildInstallCommand } from "../src/lib/detect-pm.js";

const mockExistsSync = vi.mocked(existsSync);

describe("detectPM", () => {
  it("detects pnpm", () => {
    mockExistsSync.mockImplementation((p) => String(p).includes("pnpm-lock.yaml"));
    expect(detectPM("/fake")).toBe("pnpm");
  });

  it("detects yarn", () => {
    mockExistsSync.mockImplementation((p) => String(p).includes("yarn.lock"));
    expect(detectPM("/fake")).toBe("yarn");
  });

  it("detects bun", () => {
    mockExistsSync.mockImplementation((p) => String(p).includes("bun.lockb"));
    expect(detectPM("/fake")).toBe("bun");
  });

  it("defaults to npm", () => {
    mockExistsSync.mockReturnValue(false);
    expect(detectPM("/fake")).toBe("npm");
  });
});

describe("buildInstallCommand", () => {
  it("builds pnpm add command", () => {
    expect(buildInstallCommand("pnpm", ["zod"])).toEqual(["pnpm", "add", "zod"]);
  });

  it("builds npm install command with dev flag", () => {
    expect(buildInstallCommand("npm", ["vitest"], true)).toEqual([
      "npm",
      "install",
      "--save-dev",
      "vitest",
    ]);
  });

  it("builds yarn add command", () => {
    expect(buildInstallCommand("yarn", ["express"])).toEqual(["yarn", "add", "express"]);
  });
});
