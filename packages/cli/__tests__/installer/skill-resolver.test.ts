import { describe, it, expect } from "vitest";
import { resolveSkillFiles } from "../../src/installer/skill-resolver.js";

describe("resolveSkillFiles", () => {
  it("includes SKILL.md from file list (case-insensitive)", () => {
    const result = resolveSkillFiles({
      files: [
        { path: "domain/user.entity.ts", content: "" },
        { path: "SKILL.md", content: "" },
      ],
    });

    expect(result.has("SKILL.md")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("includes files listed in skills array", () => {
    const result = resolveSkillFiles({
      skills: ["prompts/auth-skill.md", "prompts/setup-guide.md"],
      files: [{ path: "domain/user.entity.ts", content: "" }],
    });

    expect(result.has("prompts/auth-skill.md")).toBe(true);
    expect(result.has("prompts/setup-guide.md")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("returns union of skills array and SKILL.md matches", () => {
    const result = resolveSkillFiles({
      skills: ["prompts/custom.md"],
      files: [
        { path: "SKILL.md", content: "" },
        { path: "prompts/custom.md", content: "" },
      ],
    });

    expect(result.has("SKILL.md")).toBe(true);
    expect(result.has("prompts/custom.md")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("returns empty set when no skill files exist", () => {
    const result = resolveSkillFiles({
      files: [
        { path: "domain/user.entity.ts", content: "" },
        { path: "README.md", content: "" },
      ],
    });

    expect(result.size).toBe(0);
  });

  it("handles nested SKILL.md path", () => {
    const result = resolveSkillFiles({
      files: [{ path: "docs/skill.md", content: "" }],
    });

    expect(result.has("docs/skill.md")).toBe(true);
  });

  it("handles empty capability JSON", () => {
    const result = resolveSkillFiles({});
    expect(result.size).toBe(0);
  });
});
