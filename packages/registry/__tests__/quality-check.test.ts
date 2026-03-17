import { describe, it, expect, afterEach } from "vitest";
import { join } from "pathe";
import { mkdir, writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { runQualityChecks, runBridgeQualityChecks } from "../src/quality-check.js";

const REGISTRY_ROOT = import.meta.dirname ? join(import.meta.dirname, "..") : ".";

describe("runQualityChecks", () => {
  it("passes for the auth capability", async () => {
    const errors = await runQualityChecks([
      { name: "auth", path: join(REGISTRY_ROOT, "capabilities/auth") },
    ]);
    expect(errors).toEqual([]);
  });

  it("fails for a missing capability directory", async () => {
    const errors = await runQualityChecks([
      { name: "missing", path: join(REGISTRY_ROOT, "capabilities/nonexistent") },
    ]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("missing");
    expect(errors[0]).toContain("domain/entities/");
  });

  it("reports missing domain/entities/ directory", async () => {
    const errors = await runQualityChecks([
      { name: "bad", path: "/tmp/nonexistent-cap-dir" },
    ]);
    expect(errors.some((e) => e.includes("domain/entities/"))).toBe(true);
  });
});

describe("runBridgeQualityChecks", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("passes for a valid bridge (auth-audit-log)", async () => {
    const errors = await runBridgeQualityChecks([
      {
        name: "auth-audit-log",
        path: join(REGISTRY_ROOT, "bridges/auth-audit-log"),
        dependencies: ["auth", "audit-log"],
      },
    ]);
    expect(errors).toEqual([]);
  });

  it("passes for a valid bridge (auth-notifications)", async () => {
    const errors = await runBridgeQualityChecks([
      {
        name: "auth-notifications",
        path: join(REGISTRY_ROOT, "bridges/auth-notifications"),
        dependencies: ["auth", "notifications"],
      },
    ]);
    expect(errors).toEqual([]);
  });

  it("reports missing bridge.json", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "no-json");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "no-json.bridge.ts"), "export {}");
    await writeFile(join(bridgePath, "__tests__/foo.test.ts"), "");

    const errors = await runBridgeQualityChecks([
      { name: "no-json", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("bridge.json"))).toBe(true);
  });

  it("reports missing <name>.bridge.ts", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "no-bridge-ts");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), JSON.stringify({
      name: "no-bridge-ts", sourceCapability: "a", targetCapability: "b", events: ["X"], version: "1.0.0",
    }));
    await writeFile(join(bridgePath, "__tests__/foo.test.ts"), "");

    const errors = await runBridgeQualityChecks([
      { name: "no-bridge-ts", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("no-bridge-ts.bridge.ts"))).toBe(true);
  });

  it("reports missing __tests__/ directory", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "no-tests");
    await mkdir(bridgePath, { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), JSON.stringify({
      name: "no-tests", sourceCapability: "a", targetCapability: "b", events: ["X"], version: "1.0.0",
    }));
    await writeFile(join(bridgePath, "no-tests.bridge.ts"), "export {}");

    const errors = await runBridgeQualityChecks([
      { name: "no-tests", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("__tests__/"))).toBe(true);
  });

  it("reports __tests__/ with no .test.ts files", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "empty-tests");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), JSON.stringify({
      name: "empty-tests", sourceCapability: "a", targetCapability: "b", events: ["X"], version: "1.0.0",
    }));
    await writeFile(join(bridgePath, "empty-tests.bridge.ts"), "export {}");

    const errors = await runBridgeQualityChecks([
      { name: "empty-tests", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes(".test.ts"))).toBe(true);
  });

  it("reports invalid bridge.json (not valid JSON)", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "bad-json");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), "NOT JSON");
    await writeFile(join(bridgePath, "bad-json.bridge.ts"), "export {}");
    await writeFile(join(bridgePath, "__tests__/foo.test.ts"), "");

    const errors = await runBridgeQualityChecks([
      { name: "bad-json", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("bridge.json") && e.includes("parseable"))).toBe(true);
  });

  it("reports missing required fields in bridge.json", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "missing-fields");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), '{"name":"missing-fields"}');
    await writeFile(join(bridgePath, "missing-fields.bridge.ts"), "export {}");
    await writeFile(join(bridgePath, "__tests__/foo.test.ts"), "");

    const errors = await runBridgeQualityChecks([
      { name: "missing-fields", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("sourceCapability"))).toBe(true);
    expect(errors.some((e) => e.includes("targetCapability"))).toBe(true);
    expect(errors.some((e) => e.includes("events"))).toBe(true);
    expect(errors.some((e) => e.includes("version"))).toBe(true);
  });

  it("reports name mismatch between bridge.json and directory", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "bridge-qc-"));
    const bridgePath = join(tmpDir, "real-name");
    await mkdir(join(bridgePath, "__tests__"), { recursive: true });
    await writeFile(join(bridgePath, "bridge.json"), JSON.stringify({
      name: "wrong-name", sourceCapability: "a", targetCapability: "b", events: ["X"], version: "1.0.0",
    }));
    await writeFile(join(bridgePath, "real-name.bridge.ts"), "export {}");
    await writeFile(join(bridgePath, "__tests__/foo.test.ts"), "");

    const errors = await runBridgeQualityChecks([
      { name: "real-name", path: bridgePath, dependencies: [] },
    ]);
    expect(errors.some((e) => e.includes("wrong-name") && e.includes("real-name"))).toBe(true);
  });
});
