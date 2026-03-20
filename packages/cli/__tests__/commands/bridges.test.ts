import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  log: { info: vi.fn(), error: vi.fn() },
  cancel: vi.fn(),
}));

vi.mock("ofetch", () => ({
  ofetch: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("../../src/config/loader.js", () => ({
  configExists: vi.fn(),
  loadConfig: vi.fn(),
}));

vi.mock("../../src/ui/prompts.js", () => ({
  fail: vi.fn(),
}));

import * as clack from "@clack/prompts";
import { ofetch } from "ofetch";
import { readdir, readFile, stat } from "node:fs/promises";
import { configExists, loadConfig } from "../../src/config/loader.js";
import { MissingDependencyError, BridgeNotFoundError } from "../../src/errors/bridge.error.js";

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);
const mockStat = vi.mocked(stat);
const mockOfetch = vi.mocked(ofetch);
const mockConfigExists = vi.mocked(configExists);
const mockLoadConfig = vi.mocked(loadConfig);

describe("MissingDependencyError", () => {
  it("contains missing capabilities and suggestion", () => {
    const err = new MissingDependencyError(["auth", "notifications"]);
    expect(err.missingCapabilities).toEqual(["auth", "notifications"]);
    expect(err.suggestion).toContain("backcap add auth");
    expect(err.suggestion).toContain("backcap add notifications");
  });
});

describe("BridgeNotFoundError", () => {
  it("contains bridge name and suggestion", () => {
    const err = new BridgeNotFoundError("auth-payments");
    expect(err.bridgeName).toBe("auth-payments");
    expect(err.suggestion).toContain("backcap bridges");
  });
});

describe("bridges command logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters bridges by installed capabilities", () => {
    const installed = new Set(["auth", "notifications"]);
    const bridges = [
      { name: "auth-notifications", dependencies: ["auth", "notifications"] },
      { name: "auth-payments", dependencies: ["auth", "payments"] },
    ];

    const compatible = bridges.filter((b) =>
      b.dependencies.every((dep) => installed.has(dep)),
    );

    expect(compatible).toHaveLength(1);
    expect(compatible[0]!.name).toBe("auth-notifications");
  });

  it("returns empty when no capabilities installed", () => {
    const installed = new Set<string>();
    const bridges = [
      { name: "auth-notifications", dependencies: ["auth", "notifications"] },
    ];

    const compatible = bridges.filter((b) =>
      b.dependencies.every((dep) => installed.has(dep)),
    );

    expect(compatible).toHaveLength(0);
  });

  it("returns all bridges when all dependencies are met", () => {
    const installed = new Set(["auth", "notifications", "payments"]);
    const bridges = [
      { name: "auth-notifications", dependencies: ["auth", "notifications"] },
      { name: "auth-payments", dependencies: ["auth", "payments"] },
    ];

    const compatible = bridges.filter((b) =>
      b.dependencies.every((dep) => installed.has(dep)),
    );

    expect(compatible).toHaveLength(2);
  });
});

describe("bridge dependency validation", () => {
  it("detects missing dependencies for bridge installation", () => {
    const installedCapNames = new Set(["auth"]);
    const bridgeDeps = ["auth", "notifications"];

    const missing = bridgeDeps.filter((dep) => !installedCapNames.has(dep));

    expect(missing).toEqual(["notifications"]);
    const err = new MissingDependencyError(missing);
    expect(err.message).toContain("notifications");
  });

  it("passes when all dependencies are installed", () => {
    const installedCapNames = new Set(["auth", "notifications"]);
    const bridgeDeps = ["auth", "notifications"];

    const missing = bridgeDeps.filter((dep) => !installedCapNames.has(dep));

    expect(missing).toHaveLength(0);
  });
});

describe("installed config structure", () => {
  it("reads capability names from structured installed config", () => {
    const config = {
      installed: {
        capabilities: [
          { name: "auth", version: "1.0.0", adapters: ["auth-prisma"] },
          { name: "notifications", version: "1.0.0", adapters: [] },
        ],
        bridges: [
          { name: "auth-notifications", version: "0.1.0" },
        ],
      },
    };

    const capNames = new Set(config.installed.capabilities.map((c) => c.name));
    expect(capNames.has("auth")).toBe(true);
    expect(capNames.has("notifications")).toBe(true);

    const bridgeNames = new Set(config.installed.bridges.map((b) => b.name));
    expect(bridgeNames.has("auth-notifications")).toBe(true);
  });
});

describe("bridges command no-manifests output", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows install-capabilities hint when no bridge manifests found", async () => {
    mockConfigExists.mockResolvedValue(true);
    mockLoadConfig.mockResolvedValue({
      isOk: () => true,
      isFail: () => false,
      unwrap: () => ({
        paths: { capabilities: "src/capabilities", adapters: "src/adapters", bridges: "src/bridges", skills: ".claude/skills" },
        installed: { capabilities: [], bridges: [] },
      }),
    } as ReturnType<typeof loadConfig> extends Promise<infer R> ? R : never);

    // Empty bridges directory
    mockReaddir.mockResolvedValue([]);

    const bridgesCommand = await import("../../src/commands/bridges.js");
    await bridgesCommand.default.run!({ args: {} } as Parameters<NonNullable<typeof bridgesCommand.default.run>>[0]);

    expect(clack.log.info).toHaveBeenCalledWith(
      "Install capabilities first — bridges appear automatically between installed capabilities.",
    );
    expect(clack.outro).toHaveBeenCalledWith("No bridges available.");
  });
});
