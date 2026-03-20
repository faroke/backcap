import { describe, it, expect } from "vitest";
import { registrySchema } from "../../src/schemas/registry.schema.js";
import { registryItemSchema } from "../../src/schemas/registry-item.schema.js";

describe("registryItemSchema", () => {
  const validItem = {
    name: "auth",
    type: "capability" as const,
    description: "Authentication capability",
    files: [{ path: "src/auth.ts", type: "source" as const }],
  };

  it("parses a valid registry item", () => {
    const result = registryItemSchema.parse(validItem);
    expect(result.name).toBe("auth");
  });

  it("parses with optional fields", () => {
    const result = registryItemSchema.parse({
      ...validItem,
      dependencies: { zod: "^3.22" },
      peerDependencies: { express: "^4.0" },
      templateMarkers: [{ key: "{{domains_path}}", configPath: "paths.domains" }],
    });
    expect(result.dependencies).toEqual({ zod: "^3.22" });
    expect(result.templateMarkers).toHaveLength(1);
  });

  it("rejects missing required fields", () => {
    expect(() => registryItemSchema.parse({ name: "auth" })).toThrow();
  });

  it("retains unknown keys via passthrough", () => {
    const result = registryItemSchema.parse({ ...validItem, unknownField: "kept" });
    expect((result as Record<string, unknown>)["unknownField"]).toBe("kept");
  });
});

describe("registrySchema", () => {
  const validRegistry = {
    name: "backcap-registry",
    version: "1.0.0",
    description: "Official registry",
    items: [
      {
        name: "auth",
        type: "capability" as const,
        description: "Auth",
        files: [{ path: "src/auth.ts", type: "source" as const }],
      },
    ],
  };

  it("parses a valid registry", () => {
    const result = registrySchema.parse(validRegistry);
    expect(result.name).toBe("backcap-registry");
    expect(result.items).toHaveLength(1);
  });

  it("rejects missing required fields", () => {
    expect(() => registrySchema.parse({ name: "test" })).toThrow();
  });

  it("retains unknown keys via passthrough", () => {
    const result = registrySchema.parse({ ...validRegistry, extraField: "kept" });
    expect((result as Record<string, unknown>)["extraField"]).toBe("kept");
  });
});
