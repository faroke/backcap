import { describe, it, expect } from "vitest";
import { applyTemplateMarkers, resolveSharedPath } from "../src/lib/template-transform.js";

describe("applyTemplateMarkers", () => {
  it("replaces all 5 markers", () => {
    const content = `
      import { Result } from "{{shared_path}}/result";
      import type { IUserRepo } from "{{capabilities_path}}/auth/ports";
      import type { Adapter } from "{{adapters_path}}/prisma";
      import type { Bridge } from "{{bridges_path}}/notifications";
      import type { Skill } from "{{skills_path}}/auth-skill";
    `;

    const result = applyTemplateMarkers(content, {
      shared_path: "../../shared",
      capabilities_path: "src/capabilities",
      adapters_path: "src/adapters",
      bridges_path: "src/bridges",
      skills_path: ".claude/skills",
    });

    expect(result).not.toContain("{{");
    expect(result).not.toContain("}}");
    expect(result).toContain("../../shared/result");
    expect(result).toContain("src/capabilities/auth/ports");
    expect(result).toContain("src/adapters/prisma");
    expect(result).toContain("src/bridges/notifications");
    expect(result).toContain(".claude/skills/auth-skill");
  });

  it("handles content with no markers", () => {
    const content = "const x = 1;";
    const result = applyTemplateMarkers(content, { shared_path: "../../shared" });
    expect(result).toBe("const x = 1;");
  });

  it("replaces multiple occurrences of same marker", () => {
    const content = "{{shared_path}}/a and {{shared_path}}/b";
    const result = applyTemplateMarkers(content, { shared_path: "shared" });
    expect(result).toBe("shared/a and shared/b");
  });
});

describe("resolveSharedPath", () => {
  it("computes relative path from nested file to shared", () => {
    const result = resolveSharedPath(
      "src/capabilities/auth/application/use-cases/register-user.use-case.ts",
      "src/capabilities/auth",
    );
    expect(result).toBe("../../shared");
  });

  it("computes relative path from domain file to shared", () => {
    const result = resolveSharedPath(
      "src/capabilities/auth/domain/entities/user.entity.ts",
      "src/capabilities/auth",
    );
    expect(result).toBe("../../shared");
  });

  it("computes relative path from contracts to shared", () => {
    const result = resolveSharedPath(
      "src/capabilities/auth/contracts/auth.contract.ts",
      "src/capabilities/auth",
    );
    expect(result).toBe("../shared");
  });
});
