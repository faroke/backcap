import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { configSchema } from "../../src/schemas/config.schema.js";

describe("configSchema", () => {
  const validConfig = {
    framework: "nextjs",
    packageManager: "pnpm",
    paths: {
      capabilities: "src/capabilities",
      adapters: "src/adapters",
      bridges: "src/bridges",
      skills: "src/skills",
      shared: "src/shared",
    },
  };

  it("parses a valid config", () => {
    const result = configSchema.parse(validConfig);
    expect(result.framework).toBe("nextjs");
    expect(result.paths.capabilities).toBe("src/capabilities");
  });

  it("migrates legacy installed array to structured format", () => {
    const result = configSchema.parse({
      ...validConfig,
      installed: ["auth", "blog"],
    });
    expect(result.installed).toEqual({ capabilities: [], bridges: [] });
  });

  it("parses with structured installed object", () => {
    const result = configSchema.parse({
      ...validConfig,
      installed: {
        capabilities: [{ name: "auth", version: "1.0.0", adapters: ["auth-prisma"] }],
        bridges: [{ name: "auth-notifications", version: "1.0.0" }],
      },
    });
    expect(result.installed.capabilities).toHaveLength(1);
    expect(result.installed.capabilities[0]!.name).toBe("auth");
    expect(result.installed.bridges).toHaveLength(1);
    expect(result.installed.bridges[0]!.name).toBe("auth-notifications");
  });

  it("defaults installed to empty when omitted", () => {
    const result = configSchema.parse(validConfig);
    expect(result.installed).toEqual({ capabilities: [], bridges: [] });
  });

  it("retains unknown keys at top level via passthrough", () => {
    const result = configSchema.parse({ ...validConfig, customField: "value" });
    expect((result as Record<string, unknown>)["customField"]).toBe("value");
  });

  it("rejects unknown keys in strict paths sub-object", () => {
    expect(() =>
      configSchema.parse({
        ...validConfig,
        paths: { ...validConfig.paths, unknownPath: "bad" },
      }),
    ).toThrow();
  });

  it("throws ZodError with expected shape on invalid input", () => {
    try {
      configSchema.parse({ framework: "nextjs" });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      const zodError = e as ZodError;
      expect(zodError.issues.length).toBeGreaterThan(0);
      expect(zodError.issues[0]!.code).toBe("invalid_type");
    }
  });
});
