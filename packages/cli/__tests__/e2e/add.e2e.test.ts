import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { createTempDir, cleanupTempDir, scaffoldProject, fileExists } from "./helpers.js";

// Mock network layer
vi.mock("ofetch", () => ({
  ofetch: vi.fn(),
  FetchError: class FetchError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = "FetchError";
    }
  },
}));

// Mock UI layer
const failMessages: string[] = [];
const outroMessages: string[] = [];

vi.mock("../../src/ui/prompts.js", () => ({
  intro: vi.fn(),
  outro: vi.fn((msg: string) => { outroMessages.push(msg); }),
  fail: vi.fn((msg: string) => { failMessages.push(msg); }),
  promptFramework: vi.fn(),
  promptPackageManager: vi.fn(),
  promptOverwriteConfirm: vi.fn(),
  promptCustomizePaths: vi.fn(),
  promptPath: vi.fn(),
}));

vi.mock("../../src/lib/add-prompts.js", () => ({
  promptInstallConfirm: vi.fn().mockResolvedValue(true),
  promptConflictResolution: vi.fn().mockResolvedValue("compare_and_continue"),
  promptNewPath: vi.fn(),
  promptSkillConflict: vi.fn().mockResolvedValue("overwrite"),
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

// Mock install-deps to avoid real npm/pnpm installs
vi.mock("../../src/lib/install-deps.js", () => ({
  installDeps: vi.fn().mockResolvedValue(undefined),
}));

import { ofetch } from "ofetch";
import { installDeps } from "../../src/lib/install-deps.js";

const mockOfetch = vi.mocked(ofetch);
const mockInstallDeps = vi.mocked(installDeps);

const MOCK_DOMAIN_JSON = {
  name: "auth",
  type: "domain",
  version: "0.2.0",
  description: "Authentication domain",
  files: [
    { path: "domain/entities/user.entity.ts", type: "source", content: 'export class User {\n  constructor(public id: string, public email: string) {}\n}\n' },
    { path: "domain/value-objects/email.vo.ts", type: "source", content: 'export class Email {\n  constructor(public readonly value: string) {}\n}\n' },
    { path: "application/use-cases/login.use-case.ts", type: "source", content: 'export class LoginUseCase {\n  async execute() { return true; }\n}\n' },
    { path: "contracts/auth.contract.ts", type: "source", content: 'export interface IAuthService {\n  login(email: string, password: string): Promise<boolean>;\n}\n' },
    { path: "contracts/index.ts", type: "source", content: 'export { IAuthService } from "./auth.contract.js";\n' },
  ],
  dependencies: { zod: "^3.22.0" },
  peerDependencies: {},
};

describe("backcap add — E2E", () => {
  let tmpDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    vi.clearAllMocks();
    failMessages.length = 0;
    outroMessages.length = 0;
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

  async function runAdd(domain: string, args: { yes: boolean } = { yes: true }) {
    const mod = await import("../../src/commands/add.js");
    await mod.default.run!({ args: { domain, ...args } } as any);
  }

  it("installs domain files to the configured path", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_DOMAIN_JSON as any);

    await runAdd("auth");

    expect(failMessages).toHaveLength(0);

    // Verify domain files were written to disk
    const entityPath = join(tmpDir, "domains", "auth", "domain", "entities", "user.entity.ts");
    expect(await fileExists(entityPath)).toBe(true);
    const entityContent = await readFile(entityPath, "utf-8");
    expect(entityContent).toContain("export class User");

    const voPath = join(tmpDir, "domains", "auth", "domain", "value-objects", "email.vo.ts");
    expect(await fileExists(voPath)).toBe(true);

    const contractPath = join(tmpDir, "domains", "auth", "contracts", "auth.contract.ts");
    expect(await fileExists(contractPath)).toBe(true);
    const contractContent = await readFile(contractPath, "utf-8");
    expect(contractContent).toContain("IAuthService");

    const useCasePath = join(tmpDir, "domains", "auth", "application", "use-cases", "login.use-case.ts");
    expect(await fileExists(useCasePath)).toBe(true);
  });

  it("installs npm dependencies", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_DOMAIN_JSON as any);

    await runAdd("auth");

    expect(mockInstallDeps).toHaveBeenCalledWith("npm", ["zod"], tmpDir);
  });

  it("fails when backcap.json is missing", async () => {
    await scaffoldProject(tmpDir);
    // Remove backcap.json
    const { unlink } = await import("node:fs/promises");
    try { await unlink(join(tmpDir, "backcap.json")); } catch { /* noop */ }

    setCwd(tmpDir);

    await runAdd("auth");

    expect(failMessages).toContainEqual(
      expect.stringContaining("No backcap.json found"),
    );
  });

  it("fails when domain does not exist in registry", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockRejectedValue(new Error("404 Not Found"));

    await runAdd("nonexistent");

    expect(failMessages).toContainEqual(
      expect.stringContaining('Could not fetch "nonexistent"'),
    );
  });

  it("shows success message with domain name and version", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_DOMAIN_JSON as any);

    await runAdd("auth");

    expect(outroMessages.some((m) => m.includes("auth") && m.includes("0.2.0"))).toBe(true);
  });

  it("reports identical files when re-installing same domain", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_DOMAIN_JSON as any);

    // First install
    await runAdd("auth");
    outroMessages.length = 0;

    // Second install — same content
    await runAdd("auth");

    expect(outroMessages.some((m) => m.includes("Nothing to update"))).toBe(true);
  });

  it("uses pnpm when project has pnpm lockfile", async () => {
    await scaffoldProject(tmpDir, {
      lockfile: "pnpm",
      backcapJson: {
        framework: "nextjs",
        packageManager: "pnpm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_DOMAIN_JSON as any);

    await runAdd("auth");

    expect(mockInstallDeps).toHaveBeenCalledWith("pnpm", ["zod"], tmpDir);
  });
});
