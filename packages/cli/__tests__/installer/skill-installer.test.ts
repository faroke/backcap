import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  stat: vi.fn(),
}));

import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  installSkill,
  extractSkillFiles,
  resolveSkillsPath,
  mergeSkillFiles,
} from "../../src/installer/skill-installer.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

describe("installSkill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  it("installs skill files to skills path", async () => {
    mockReadFile.mockResolvedValue("existing core");

    await installSkill({
      skillsPath: ".claude/skills",
      capabilityName: "auth",
      skillFiles: [
        { path: "SKILL.md", content: "# Auth Skill" },
        { path: "references/domain-map.md", content: "# Domain Map" },
      ],
      coreSkillFiles: [],
      templateValues: { capabilities_path: "src/capabilities" },
    });

    expect(mockWriteFile).toHaveBeenCalledTimes(2);
    expect(mockWriteFile).toHaveBeenCalledWith(
      ".claude/skills/backcap-auth/SKILL.md",
      "# Auth Skill",
      "utf-8",
    );
  });

  it("installs core skill when absent", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    await installSkill({
      skillsPath: ".claude/skills",
      capabilityName: "auth",
      skillFiles: [{ path: "SKILL.md", content: "# Auth" }],
      coreSkillFiles: [{ path: "SKILL.md", content: "# Core" }],
      templateValues: {},
    });

    // Core skill + auth skill
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
    expect(mockWriteFile).toHaveBeenCalledWith(
      ".claude/skills/backcap-core/SKILL.md",
      "# Core",
      "utf-8",
    );
  });

  it("skips core skill when already present", async () => {
    mockReadFile.mockResolvedValue("# Existing Core");

    await installSkill({
      skillsPath: ".claude/skills",
      capabilityName: "auth",
      skillFiles: [{ path: "SKILL.md", content: "# Auth" }],
      coreSkillFiles: [{ path: "SKILL.md", content: "# Core Updated" }],
      templateValues: {},
    });

    // Only auth skill written
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledWith(
      ".claude/skills/backcap-auth/SKILL.md",
      "# Auth",
      "utf-8",
    );
  });

  it("replaces template markers in skill content", async () => {
    mockReadFile.mockResolvedValue("core exists");

    await installSkill({
      skillsPath: ".claude/skills",
      capabilityName: "auth",
      skillFiles: [
        { path: "SKILL.md", content: "Path: {{capabilities_path}}/auth" },
      ],
      coreSkillFiles: [],
      templateValues: { capabilities_path: "src/capabilities" },
    });

    expect(mockWriteFile).toHaveBeenCalledWith(
      ".claude/skills/backcap-auth/SKILL.md",
      "Path: src/capabilities/auth",
      "utf-8",
    );
  });

  it("installs to custom skills path from config", async () => {
    mockReadFile.mockResolvedValue("core exists");

    await installSkill({
      skillsPath: "custom/agent-skills",
      capabilityName: "auth",
      skillFiles: [{ path: "SKILL.md", content: "# Auth" }],
      coreSkillFiles: [],
      templateValues: {},
    });

    expect(mockWriteFile).toHaveBeenCalledWith(
      "custom/agent-skills/backcap-auth/SKILL.md",
      "# Auth",
      "utf-8",
    );
  });
});

describe("extractSkillFiles", () => {
  it("extracts files with type skill", () => {
    const files = [
      { path: "domain/user.entity.ts", type: "source", content: "class User {}" },
      { path: "skills/SKILL.md", type: "skill", content: "# Skill" },
      { path: "skills/references/map.md", type: "skill", content: "# Map" },
    ];

    const result = extractSkillFiles(files);
    expect(result).toHaveLength(2);
    expect(result[0]!.path).toBe("SKILL.md");
    expect(result[1]!.path).toBe("references/map.md");
  });

  it("extracts files with skills/ prefix", () => {
    const files = [
      { path: "skills/SKILL.md", content: "# Skill" },
    ];

    const result = extractSkillFiles(files);
    expect(result).toHaveLength(1);
    expect(result[0]!.path).toBe("SKILL.md");
  });

  it("returns empty for no skill files", () => {
    const files = [
      { path: "domain/user.entity.ts", type: "source", content: "code" },
    ];
    expect(extractSkillFiles(files)).toEqual([]);
  });
});

describe("resolveSkillsPath", () => {
  it("returns configured skills path", () => {
    expect(resolveSkillsPath({ paths: { skills: "custom/skills" } })).toBe("custom/skills");
  });

  it("defaults to .claude/skills", () => {
    expect(resolveSkillsPath({ paths: {} })).toBe(".claude/skills");
  });
});

describe("mergeSkillFiles", () => {
  it("appends missing sections from incoming", () => {
    const existing = "## Domain Map\nExisting domain map\n\n## Conventions\nExisting conventions";
    const incoming = "## Domain Map\nNew domain map\n\n## Conventions\nNew conventions\n\n## Bridges\nNew bridges";

    const result = mergeSkillFiles(existing, incoming);
    expect(result).toContain("Existing domain map");
    expect(result).toContain("## Bridges");
    expect(result).toContain("New bridges");
    expect(result).not.toContain("New domain map");
  });

  it("returns existing unchanged when no new sections", () => {
    const existing = "## Domain Map\nContent\n\n## Conventions\nContent";
    const incoming = "## Domain Map\nDifferent\n\n## Conventions\nDifferent";

    const result = mergeSkillFiles(existing, incoming);
    expect(result).toBe(existing);
  });

  it("handles incoming with all new sections", () => {
    const existing = "## Overview\nSome overview";
    const incoming = "## Domain Map\nMap content\n\n## Bridges\nBridge content";

    const result = mergeSkillFiles(existing, incoming);
    expect(result).toContain("## Overview");
    expect(result).toContain("## Domain Map");
    expect(result).toContain("## Bridges");
  });
});
