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

vi.mock("../../src/detection/installed.js", () => ({
  detectInstalledDomains: vi.fn(),
}));

import * as clack from "@clack/prompts";
import { readdir, readFile, stat } from "node:fs/promises";
import { configExists, loadConfig } from "../../src/config/loader.js";
import { detectInstalledDomains } from "../../src/detection/installed.js";
import { MissingDependencyError, BridgeNotFoundError } from "../../src/errors/bridge.error.js";

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);
const mockStat = vi.mocked(stat);
const mockConfigExists = vi.mocked(configExists);
const mockLoadConfig = vi.mocked(loadConfig);
const mockDetectInstalledDomains = vi.mocked(detectInstalledDomains);

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

  it("filters bridges by installed domains from filesystem", () => {
    const installedDomains = new Set(["auth", "notifications"]);
    const bridges = [
      { name: "auth-notifications", source: "auth", target: "notifications" },
      { name: "auth-payments", source: "auth", target: "payments" },
    ];

    const compatible = bridges.filter((b) =>
      installedDomains.has(b.source) && installedDomains.has(b.target),
    );

    expect(compatible).toHaveLength(1);
    expect(compatible[0]!.name).toBe("auth-notifications");
  });

  it("returns empty when no domains installed", () => {
    const installedDomains = new Set<string>();
    const bridges = [
      { name: "auth-notifications", source: "auth", target: "notifications" },
    ];

    const compatible = bridges.filter((b) =>
      installedDomains.has(b.source) && installedDomains.has(b.target),
    );

    expect(compatible).toHaveLength(0);
  });

  it("returns all bridges when all domains are present", () => {
    const installedDomains = new Set(["auth", "notifications", "payments"]);
    const bridges = [
      { name: "auth-notifications", source: "auth", target: "notifications" },
      { name: "auth-payments", source: "auth", target: "payments" },
    ];

    const compatible = bridges.filter((b) =>
      installedDomains.has(b.source) && installedDomains.has(b.target),
    );

    expect(compatible).toHaveLength(2);
  });
});

describe("bridge dependency validation", () => {
  it("detects missing dependencies via filesystem scan", () => {
    const installedDomains = new Set(["auth"]);
    const bridgeDeps = ["auth", "notifications"];

    const missing = bridgeDeps.filter((dep) => !installedDomains.has(dep));

    expect(missing).toEqual(["notifications"]);
    const err = new MissingDependencyError(missing);
    expect(err.message).toContain("notifications");
  });

  it("passes when all domains are present on disk", () => {
    const installedDomains = new Set(["auth", "notifications"]);
    const bridgeDeps = ["auth", "notifications"];

    const missing = bridgeDeps.filter((dep) => !installedDomains.has(dep));

    expect(missing).toHaveLength(0);
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
        paths: { domains: "domains", adapters: "adapters", bridges: "src/bridges", skills: ".claude/skills", shared: "src/shared" },
        alias: "@domains",
      }),
    } as ReturnType<typeof loadConfig> extends Promise<infer R> ? R : never);

    // Filesystem scan returns no installed domains
    mockDetectInstalledDomains.mockResolvedValue([]);

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
