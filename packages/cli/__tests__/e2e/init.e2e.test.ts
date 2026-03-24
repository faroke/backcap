import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { createTempDir, cleanupTempDir, scaffoldProject, readJson, fileExists } from "./helpers.js";

// Mock only the UI layer (TTY prompts + process.exit in fail())
const failMessages: string[] = [];

vi.mock("../../src/ui/prompts.js", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  fail: vi.fn((msg: string) => { failMessages.push(msg); }),
  promptFramework: vi.fn(),
  promptPackageManager: vi.fn(),
  promptOverwriteConfirm: vi.fn(),
  promptCustomizePaths: vi.fn().mockResolvedValue(false),
  promptPath: vi.fn(),
}));

vi.mock("consola", () => ({
  createConsola: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    start: vi.fn(),
  }),
}));

import { fail as mockFail, outro as mockOutro } from "../../src/ui/prompts.js";

describe("backcap init — E2E", () => {
  let tmpDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    vi.clearAllMocks();
    failMessages.length = 0;
    tmpDir = await createTempDir();
    originalCwd = process.cwd;
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    await cleanupTempDir(tmpDir);
  });

  function setCwd(dir: string) {
    process.cwd = () => dir;
  }

  async function runInit(args: { yes: boolean } = { yes: true }) {
    const mod = await import("../../src/commands/init.js");
    await mod.default.run!({ args } as any);
  }

  it("creates backcap.json with detected Express + npm", async () => {
    await scaffoldProject(tmpDir, {
      packageJson: { name: "my-app", dependencies: { express: "^4.18.0" } },
      lockfile: "npm",
    });
    setCwd(tmpDir);

    await runInit();

    expect(failMessages).toHaveLength(0);

    const config = await readJson(join(tmpDir, "backcap.json")) as Record<string, unknown>;
    expect(config).toMatchObject({
      framework: "express",
      packageManager: "npm",
      paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
      alias: "@domains",
    });
  });

  it("creates backcap.json with detected Next.js + pnpm", async () => {
    await scaffoldProject(tmpDir, {
      packageJson: { name: "my-app", dependencies: { next: "^14.0.0" } },
      lockfile: "pnpm",
    });
    setCwd(tmpDir);

    await runInit();

    expect(failMessages).toHaveLength(0);

    const config = await readJson(join(tmpDir, "backcap.json")) as Record<string, unknown>;
    expect(config).toMatchObject({
      framework: "nextjs",
      packageManager: "pnpm",
    });
  });

  it("creates backcap.json with detected Fastify + yarn", async () => {
    await scaffoldProject(tmpDir, {
      packageJson: { name: "my-app", dependencies: { fastify: "^4.0.0" } },
      lockfile: "yarn",
    });
    setCwd(tmpDir);

    await runInit();

    expect(failMessages).toHaveLength(0);

    const config = await readJson(join(tmpDir, "backcap.json")) as Record<string, unknown>;
    expect(config).toMatchObject({
      framework: "fastify",
      packageManager: "yarn",
    });
  });

  it("injects @domains alias into tsconfig.json", async () => {
    await scaffoldProject(tmpDir, {
      tsconfig: { compilerOptions: { strict: true, paths: { "@utils/*": ["src/utils/*"] } } },
    });
    setCwd(tmpDir);

    await runInit();

    const tsconfig = await readJson(join(tmpDir, "tsconfig.json")) as any;
    expect(tsconfig.compilerOptions.paths["@domains/*"]).toEqual(["domains/*"]);
    // Existing paths preserved
    expect(tsconfig.compilerOptions.paths["@utils/*"]).toEqual(["src/utils/*"]);
  });

  it("creates compilerOptions.paths when tsconfig has no compilerOptions", async () => {
    await scaffoldProject(tmpDir, {
      tsconfig: { include: ["src"] },
    });
    setCwd(tmpDir);

    await runInit();

    const tsconfig = await readJson(join(tmpDir, "tsconfig.json")) as any;
    expect(tsconfig.compilerOptions.paths["@domains/*"]).toEqual(["domains/*"]);
    expect(tsconfig.include).toEqual(["src"]);
  });

  it("fails gracefully when tsconfig.json is missing", async () => {
    await scaffoldProject(tmpDir);
    // Remove tsconfig
    const { unlink } = await import("node:fs/promises");
    await unlink(join(tmpDir, "tsconfig.json"));

    setCwd(tmpDir);
    await runInit();

    expect(failMessages).toContainEqual(
      expect.stringContaining("tsconfig.json not found"),
    );
  });

  it("fails when framework cannot be detected in --yes mode", async () => {
    await scaffoldProject(tmpDir, {
      packageJson: { name: "my-app", dependencies: {} },
    });
    setCwd(tmpDir);

    await runInit();

    expect(failMessages).toContainEqual(
      expect.stringContaining("Cannot detect framework"),
    );
  });

  it("backcap.json is valid JSON with correct structure", async () => {
    await scaffoldProject(tmpDir);
    setCwd(tmpDir);

    await runInit();

    const config = await readJson(join(tmpDir, "backcap.json")) as any;
    expect(config).toHaveProperty("framework");
    expect(config).toHaveProperty("packageManager");
    expect(config).toHaveProperty("paths");
    expect(config).toHaveProperty("alias");
    expect(typeof config.framework).toBe("string");
    expect(typeof config.packageManager).toBe("string");
    expect(typeof config.paths.domains).toBe("string");
    expect(typeof config.alias).toBe("string");
  });
});
