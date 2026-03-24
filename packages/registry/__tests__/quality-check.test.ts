import { describe, it, expect } from "vitest";
import { join } from "pathe";
import { runQualityChecks } from "../src/quality-check.js";

const REGISTRY_ROOT = import.meta.dirname ? join(import.meta.dirname, "..") : ".";

describe("runQualityChecks", () => {
  it("passes for the auth domain", async () => {
    const errors = await runQualityChecks([
      { name: "auth", path: join(REGISTRY_ROOT, "domains/auth") },
    ]);
    expect(errors).toEqual([]);
  });

  it("fails for a missing domain directory", async () => {
    const errors = await runQualityChecks([
      { name: "missing", path: join(REGISTRY_ROOT, "domains/nonexistent") },
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
