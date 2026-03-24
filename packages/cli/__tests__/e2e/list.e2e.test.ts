import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { createTempDir, cleanupTempDir, scaffoldProject } from "./helpers.js";

// Mock network layer — no real HTTP calls
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
vi.mock("../../src/ui/prompts.js", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  fail: vi.fn(),
  promptFramework: vi.fn(),
  promptPackageManager: vi.fn(),
  promptOverwriteConfirm: vi.fn(),
  promptCustomizePaths: vi.fn(),
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

import { ofetch } from "ofetch";
const mockOfetch = vi.mocked(ofetch);

const MOCK_REGISTRY = {
  name: "backcap-registry",
  version: "1.0.0",
  description: "Domain registry",
  items: [
    { name: "auth", type: "domain", description: "Authentication and authorization", files: [] },
    { name: "blog", type: "domain", description: "Blog with CRUD operations", files: [] },
    { name: "catalog", type: "domain", description: "Product catalog management", files: [], version: "0.3.0" },
  ],
};

describe("backcap list — E2E", () => {
  let tmpDir: string;
  let originalCwd: () => string;
  let originalStdoutWrite: typeof process.stdout.write;
  let capturedOutput: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    tmpDir = await createTempDir();
    originalCwd = process.cwd;
    capturedOutput = "";
    originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => {
      capturedOutput += String(chunk);
      return true;
    }) as typeof process.stdout.write;
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    process.stdout.write = originalStdoutWrite;
    await cleanupTempDir(tmpDir);
  });

  function setCwd(dir: string) {
    process.cwd = () => dir;
  }

  async function runList() {
    const mod = await import("../../src/commands/list.js");
    await mod.default.run!({ args: {} } as any);
  }

  it("renders a table with all registry domains", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_REGISTRY as any);

    await runList();

    expect(capturedOutput).toContain("auth");
    expect(capturedOutput).toContain("blog");
    expect(capturedOutput).toContain("catalog");
    expect(capturedOutput).toContain("3 domains available");
  });

  it("marks installed domains with ✓", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });

    // Create an installed domain directory
    await mkdir(join(tmpDir, "domains", "auth"), { recursive: true });

    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_REGISTRY as any);

    await runList();

    // Auth should be marked as installed
    const lines = capturedOutput.split("\n");
    const authLine = lines.find((l) => l.includes("auth"));
    expect(authLine).toContain("✓");

    // Blog should NOT be installed
    const blogLine = lines.find((l) => l.includes("blog"));
    expect(blogLine).toContain("—");
  });

  it("shows version for domains that have one", async () => {
    await scaffoldProject(tmpDir, {
      backcapJson: {
        framework: "express",
        packageManager: "npm",
        paths: { domains: "domains", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      },
    });
    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_REGISTRY as any);

    await runList();

    expect(capturedOutput).toContain("0.3.0");
  });

  it("works without backcap.json (no installed detection)", async () => {
    await scaffoldProject(tmpDir);
    // Remove backcap.json — list should still work
    const { unlink } = await import("node:fs/promises");
    try { await unlink(join(tmpDir, "backcap.json")); } catch { /* may not exist */ }

    setCwd(tmpDir);
    mockOfetch.mockResolvedValue(MOCK_REGISTRY as any);

    await runList();

    expect(capturedOutput).toContain("auth");
    expect(capturedOutput).toContain("3 domains available");
  });
});
