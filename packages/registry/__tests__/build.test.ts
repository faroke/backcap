import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "pathe";

const DIST = import.meta.dirname ? join(import.meta.dirname, "../dist") : "./dist";

describe("registry build output", () => {
  it("registry.json has correct shape", async () => {
    const raw = await readFile(join(DIST, "registry.json"), "utf-8");
    const registry = JSON.parse(raw);
    expect(registry.name).toBe("backcap-registry");
    expect(registry.version).toBe("1.0.0");
    expect(registry.items).toBeInstanceOf(Array);
    expect(registry.items.length).toBeGreaterThan(0);
  });

  it("auth.json has correct shape", async () => {
    const raw = await readFile(join(DIST, "auth.json"), "utf-8");
    const item = JSON.parse(raw);
    expect(item.name).toBe("auth");
    expect(item.type).toBe("capability");
    expect(item.files).toBeInstanceOf(Array);
    expect(item.files.length).toBeGreaterThan(0);
  });

  it("auth.json includes shared/result.ts", async () => {
    const raw = await readFile(join(DIST, "auth.json"), "utf-8");
    const item = JSON.parse(raw);
    const resultFile = item.files.find((f: { path: string }) => f.path === "shared/result.ts");
    expect(resultFile).toBeDefined();
    expect(resultFile.content).toContain("class Result");
  });

  it("source files contain no template markers", async () => {
    const raw = await readFile(join(DIST, "auth.json"), "utf-8");
    const item = JSON.parse(raw);
    for (const file of item.files) {
      expect(file.content).not.toContain("// Template:");
      expect(file.content).not.toContain("{{shared_path}}");
    }
  });

  it("adapter JSONs have correct category", async () => {
    const prismaRaw = await readFile(join(DIST, "auth-prisma.json"), "utf-8");
    const prisma = JSON.parse(prismaRaw);
    expect(prisma.name).toBe("auth-prisma");
    expect(prisma.type).toBe("adapter");

    const expressRaw = await readFile(join(DIST, "auth-express.json"), "utf-8");
    const express = JSON.parse(expressRaw);
    expect(express.name).toBe("auth-express");
    expect(express.type).toBe("adapter");
  });
});
