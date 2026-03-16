import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external dependencies
vi.mock("pkg-types", () => ({
  readPackageJSON: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
}));

vi.mock("consola", () => ({
  createConsola: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { readPackageJSON } from "pkg-types";
import { stat, readFile, writeFile } from "node:fs/promises";
import { detectFramework } from "../../src/detection/framework.js";
import { detectPackageManager } from "../../src/detection/package-manager.js";
import { configExists, writeConfig } from "../../src/config/loader.js";
import { buildDefaultConfig } from "../../src/config/defaults.js";

const mockReadPkg = vi.mocked(readPackageJSON);
const mockStat = vi.mocked(stat);
const mockWriteFile = vi.mocked(writeFile);

describe("init command integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStat.mockImplementation(() => Promise.reject(new Error("ENOENT")));
    mockWriteFile.mockResolvedValue(undefined);
  });

  it("detects Express + npm and writes correct config", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { express: "^4.18.0" },
    } as any);
    mockStat.mockImplementation((path) =>
      String(path).includes("package-lock.json")
        ? Promise.resolve({} as any)
        : Promise.reject(new Error("ENOENT")),
    );

    const fwResult = await detectFramework("/project");
    expect(fwResult.unwrap()).toBe("express");

    const pmResult = await detectPackageManager("/project");
    expect(pmResult.unwrap()).toBe("npm");

    const config = buildDefaultConfig(fwResult.unwrap(), pmResult.unwrap());
    expect(config.framework).toBe("express");
    expect(config.packageManager).toBe("npm");
    expect(config.paths.capabilities).toBe("src/capabilities");
    expect(config.installed).toEqual([]);

    const writeResult = await writeConfig(config, "/project");
    expect(writeResult.isOk()).toBe(true);

    const written = JSON.parse(
      (mockWriteFile.mock.calls[0]![1] as string).trim(),
    );
    expect(written).toEqual({
      framework: "express",
      packageManager: "npm",
      paths: {
        capabilities: "src/capabilities",
        adapters: "src/adapters",
        bridges: "src/bridges",
        skills: "src/skills",
        shared: "src/shared",
      },
      installed: [],
    });
  });

  it("detects Next.js + pnpm and writes correct config", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { next: "^14.0.0" },
    } as any);
    mockStat.mockImplementation((path) =>
      String(path).includes("pnpm-lock.yaml")
        ? Promise.resolve({} as any)
        : Promise.reject(new Error("ENOENT")),
    );

    const fwResult = await detectFramework("/project");
    expect(fwResult.unwrap()).toBe("nextjs");

    const pmResult = await detectPackageManager("/project");
    expect(pmResult.unwrap()).toBe("pnpm");

    const config = buildDefaultConfig(fwResult.unwrap(), pmResult.unwrap());
    const writeResult = await writeConfig(config, "/project");
    expect(writeResult.isOk()).toBe(true);

    const written = JSON.parse(
      (mockWriteFile.mock.calls[0]![1] as string).trim(),
    );
    expect(written.framework).toBe("nextjs");
    expect(written.packageManager).toBe("pnpm");
  });

  it("configExists returns false when no backcap.json", async () => {
    mockStat.mockRejectedValue(new Error("ENOENT"));
    expect(await configExists("/project")).toBe(false);
  });

  it("configExists returns true when backcap.json exists", async () => {
    mockStat.mockResolvedValue({} as any);
    expect(await configExists("/project")).toBe(true);
  });
});
