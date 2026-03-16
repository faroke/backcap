import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "pathe";
import { applyTemplateMarkers } from "../lib/template-transform.js";

export interface SkillFileEntry {
  path: string;
  content: string;
}

export interface SkillInstallOptions {
  skillsPath: string;
  capabilityName: string;
  skillFiles: SkillFileEntry[];
  coreSkillFiles: SkillFileEntry[];
  templateValues: Record<string, string>;
}

export async function installSkill(options: SkillInstallOptions): Promise<void> {
  const { skillsPath, capabilityName, skillFiles, coreSkillFiles, templateValues } = options;

  // Auto-install core skill if absent
  await installCoreSkillIfAbsent(skillsPath, coreSkillFiles, templateValues);

  // Install capability skill
  const skillDir = join(skillsPath, `backcap-${capabilityName}`);
  await writeSkillFiles(skillDir, skillFiles, templateValues);
}

async function installCoreSkillIfAbsent(
  skillsPath: string,
  coreFiles: SkillFileEntry[],
  templateValues: Record<string, string>,
): Promise<void> {
  if (coreFiles.length === 0) return;

  const coreSkillPath = join(skillsPath, "backcap-core", "SKILL.md");
  try {
    await readFile(coreSkillPath, "utf-8");
    // Core skill exists, skip
    return;
  } catch {
    // Core skill doesn't exist, install it
  }

  const coreDir = join(skillsPath, "backcap-core");
  await writeSkillFiles(coreDir, coreFiles, templateValues);
}

async function writeSkillFiles(
  targetDir: string,
  files: SkillFileEntry[],
  templateValues: Record<string, string>,
): Promise<void> {
  for (const file of files) {
    const destPath = join(targetDir, file.path);
    const dir = dirname(destPath);
    await mkdir(dir, { recursive: true });

    const content = applyTemplateMarkers(file.content, templateValues);
    await writeFile(destPath, content, "utf-8");
  }
}

export function extractSkillFiles(
  files: Array<{ path: string; content?: string; type?: string }>,
): SkillFileEntry[] {
  return files
    .filter((f) => f.type === "skill" || f.path.startsWith("skills/"))
    .filter((f): f is { path: string; content: string } => typeof f.content === "string")
    .map((f) => ({
      path: f.path.replace(/^skills\//, ""),
      content: f.content,
    }));
}

export function resolveSkillsPath(config: { paths: { skills?: string } }): string {
  return config.paths.skills ?? ".claude/skills";
}

export function mergeSkillFiles(existing: string, incoming: string): string {
  const existingSections = parseSections(existing);
  const incomingSections = parseSections(incoming);

  const existingNames = new Set(existingSections.map((s) => s.name));
  const newSections = incomingSections.filter((s) => !existingNames.has(s.name));

  if (newSections.length === 0) return existing;

  return existing.trimEnd() + "\n\n" + newSections.map((s) => s.content).join("\n\n") + "\n";
}

interface Section {
  name: string;
  content: string;
}

function parseSections(content: string): Section[] {
  const sections: Section[] = [];
  const lines = content.split("\n");
  let currentName = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) {
      if (currentName) {
        sections.push({ name: currentName, content: currentLines.join("\n") });
      }
      currentName = match[1]!.trim();
      currentLines = [line];
    } else if (currentName) {
      currentLines.push(line);
    }
  }

  if (currentName) {
    sections.push({ name: currentName, content: currentLines.join("\n") });
  }

  return sections;
}
