import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { configSchema } from "../../src/schemas/config.schema.js";

describe("configSchema", () => {
  const validConfig = {
    framework: "nextjs",
    packageManager: "pnpm",
    paths: {
      domains: "domains",
      adapters: "adapters",
      bridges: "src/bridges",
      skills: "src/skills",
      shared: "src/shared",
    },
  };

  it("parses a valid config", () => {
    const result = configSchema.parse(validConfig);
    expect(result.framework).toBe("nextjs");
    expect(result.paths.domains).toBe("domains");
  });

  it("defaults alias to @domains when omitted", () => {
    const result = configSchema.parse(validConfig);
    expect(result.alias).toBe("@domains");
  });

  it("parses config with explicit alias", () => {
    const result = configSchema.parse({
      ...validConfig,
      alias: "@custom",
    });
    expect(result.alias).toBe("@custom");
  });

  it("has no installed field", () => {
    const result = configSchema.parse(validConfig);
    expect(result).not.toHaveProperty("installed");
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
