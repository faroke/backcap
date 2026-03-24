import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "pathe";
import type { DomainMeta, SkillMeta } from "./types.js";

async function readAllFiles(
  dir: string,
  base: string,
): Promise<Array<{ path: string; type: string; content: string }>> {
  const results: Array<{ path: string; type: string; content: string }> = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__" || entry.name === "node_modules") continue;
        await walk(fullPath);
      } else if (entry.isFile()) {
        const relPath = relative(base, fullPath);
        const content = await readFile(fullPath, "utf-8");
        const type = entry.name.endsWith(".ts") ? "source" : "config";
        results.push({ path: relPath, type, content });
      }
    }
  }

  await walk(dir);
  return results;
}

export async function discoverDomains(
  registryRoot: string,
): Promise<DomainMeta[]> {
  const capDir = join(registryRoot, "domains");
  const entries = await readdir(capDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, path: join(capDir, e.name) }));
}

export async function generateDomainItemJson(
  cap: DomainMeta,
  resultTs: string,
): Promise<Record<string, unknown>> {
  const files = await readAllFiles(cap.path, cap.path);

  // Inject shared/result.ts if not already present
  if (!files.some((f) => f.path === "shared/result.ts")) {
    files.push({ path: "shared/result.ts", type: "source", content: resultTs });
  }

  return {
    name: cap.name,
    type: "domain",
    description: `${cap.name} domain`,
    files,
    dependencies: {},
    peerDependencies: {},
  };
}

export async function discoverSkills(
  registryRoot: string,
): Promise<SkillMeta[]> {
  const skillsDir = join(registryRoot, "skills");
  const results: SkillMeta[] = [];

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      results.push({
        name: entry.name,
        path: join(skillsDir, entry.name),
      });
    }
  } catch {
    // no skills directory
  }

  return results;
}

export async function generateSkillItemJson(
  skill: SkillMeta,
): Promise<Record<string, unknown>> {
  const files: Array<{ path: string; type: string; content: string }> = [];

  async function walk(dir: string, base: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, base);
      } else if (entry.isFile()) {
        const relPath = relative(base, fullPath);
        const content = await readFile(fullPath, "utf-8");
        const type = entry.name.endsWith(".md") ? "config" : "source";
        files.push({ path: relPath, type, content });
      }
    }
  }

  await walk(skill.path, skill.path);

  return {
    name: skill.name,
    type: "skill",
    description: `${skill.name} AI skill`,
    files,
  };
}

export async function generateRegistryCatalog(
  domains: Array<Record<string, unknown>>,
  skills: Array<Record<string, unknown>> = [],
): Promise<Record<string, unknown>> {
  return {
    name: "backcap-registry",
    version: "1.0.0",
    description: "Official Backcap domain registry",
    items: [...domains, ...skills],
  };
}
