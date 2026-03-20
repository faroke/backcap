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

vi.mock("../../src/ui/prompts.js", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  fail: vi.fn(),
  promptFramework: vi.fn(),
  promptPackageManager: vi.fn(),
  promptOverwriteConfirm: vi.fn(),
}));

import { readPackageJSON } from "pkg-types";
import { stat, readFile, writeFile } from "node:fs/promises";
import { detectFramework } from "../../src/detection/framework.js";
import { detectPackageManager } from "../../src/detection/package-manager.js";
import { configExists, writeConfig } from "../../src/config/loader.js";
import { buildDefaultConfig } from "../../src/config/defaults.js";
import { fail as mockFailFn } from "../../src/ui/prompts.js";

const mockReadPkg = vi.mocked(readPackageJSON);
const mockStat = vi.mocked(stat);
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockFail = vi.mocked(mockFailFn);

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
    expect(config.paths.domains).toBe("domains");
    expect(config.alias).toBe("@domains");
    expect(config).not.toHaveProperty("installed");

    const writeResult = await writeConfig(config, "/project");
    expect(writeResult.isOk()).toBe(true);

    const written = JSON.parse(
      (mockWriteFile.mock.calls[0]![1] as string).trim(),
    );
    expect(written).toEqual({
      framework: "express",
      packageManager: "npm",
      paths: {
        domains: "domains",
        adapters: "adapters",
        bridges: "bridges",
        skills: ".claude/skills",
        shared: "src/shared",
      },
      alias: "@domains",
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

describe("init tsconfig prerequisite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
  });

  it("exits with error when tsconfig.json does not exist", async () => {
    // stat rejects for everything (no tsconfig.json)
    mockStat.mockImplementation(() => Promise.reject(new Error("ENOENT")));

    const initCommand = await import("../../src/commands/init.js");

    // Mock process.cwd
    const originalCwd = process.cwd;
    process.cwd = () => "/project";

    try {
      await initCommand.default.run!({ args: { yes: true } } as any);
    } finally {
      process.cwd = originalCwd;
    }

    expect(mockFail).toHaveBeenCalledWith(
      "tsconfig.json not found. Backcap requires a TypeScript project with tsconfig.json.",
    );
  });

  it("injects alias into existing tsconfig with paths", async () => {
    const existingTsconfig = {
      compilerOptions: {
        strict: true,
        paths: {
          "@utils/*": ["src/utils/*"],
        },
      },
    };

    mockStat.mockImplementation((path) => {
      const p = String(path);
      if (p.includes("tsconfig.json") || p.includes("package-lock.json")) {
        return Promise.resolve({} as any);
      }
      return Promise.reject(new Error("ENOENT"));
    });

    mockReadPkg.mockResolvedValue({
      dependencies: { express: "^4.18.0" },
    } as any);

    mockReadFile.mockImplementation((path) => {
      if (String(path).includes("tsconfig.json")) {
        return Promise.resolve(JSON.stringify(existingTsconfig));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const initCommand = await import("../../src/commands/init.js");
    const originalCwd = process.cwd;
    process.cwd = () => "/project";

    try {
      await initCommand.default.run!({ args: { yes: true } } as any);
    } finally {
      process.cwd = originalCwd;
    }

    // Find the writeFile call for tsconfig.json
    const tsconfigWriteCall = mockWriteFile.mock.calls.find((call) =>
      String(call[0]).includes("tsconfig.json"),
    );
    expect(tsconfigWriteCall).toBeDefined();

    const writtenTsconfig = JSON.parse(tsconfigWriteCall![1] as string);
    // Existing paths preserved
    expect(writtenTsconfig.compilerOptions.paths["@utils/*"]).toEqual(["src/utils/*"]);
    // New alias added
    expect(writtenTsconfig.compilerOptions.paths["@domains/*"]).toEqual(["domains/*"]);
  });

  it("injects alias into tsconfig without compilerOptions", async () => {
    const existingTsconfig = {
      include: ["src"],
    };

    mockStat.mockImplementation((path) => {
      const p = String(path);
      if (p.includes("tsconfig.json") || p.includes("package-lock.json")) {
        return Promise.resolve({} as any);
      }
      return Promise.reject(new Error("ENOENT"));
    });

    mockReadPkg.mockResolvedValue({
      dependencies: { express: "^4.18.0" },
    } as any);

    mockReadFile.mockImplementation((path) => {
      if (String(path).includes("tsconfig.json")) {
        return Promise.resolve(JSON.stringify(existingTsconfig));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const initCommand = await import("../../src/commands/init.js");
    const originalCwd = process.cwd;
    process.cwd = () => "/project";

    try {
      await initCommand.default.run!({ args: { yes: true } } as any);
    } finally {
      process.cwd = originalCwd;
    }

    const tsconfigWriteCall = mockWriteFile.mock.calls.find((call) =>
      String(call[0]).includes("tsconfig.json"),
    );
    expect(tsconfigWriteCall).toBeDefined();

    const writtenTsconfig = JSON.parse(tsconfigWriteCall![1] as string);
    expect(writtenTsconfig.compilerOptions.paths["@domains/*"]).toEqual(["domains/*"]);
    // Original fields preserved
    expect(writtenTsconfig.include).toEqual(["src"]);
  });
});
