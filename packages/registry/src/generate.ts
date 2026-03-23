import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "pathe";
import type { DomainMeta, AdapterMeta, BridgeMeta, SkillMeta } from "./types.js";

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

export async function discoverAdapters(
  registryRoot: string,
): Promise<AdapterMeta[]> {
  const adaptersDir = join(registryRoot, "adapters");
  const results: AdapterMeta[] = [];

  try {
    const categories = await readdir(adaptersDir, { withFileTypes: true });
    for (const cat of categories) {
      if (!cat.isDirectory()) continue;
      const categoryPath = join(adaptersDir, cat.name);
      const domains = await readdir(categoryPath, { withFileTypes: true });
      for (const cap of domains) {
        if (!cap.isDirectory()) continue;
        results.push({
          name: `${cap.name}-${cat.name}`,
          path: join(categoryPath, cap.name),
          domain: cap.name,
          category: cat.name === "prisma" ? "persistence" : "http",
        });
      }
    }
  } catch {
    // no adapters directory
  }

  return results;
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

export async function generateAdapterItemJson(
  adapter: AdapterMeta,
): Promise<Record<string, unknown>> {
  const files = await readAllFiles(adapter.path, adapter.path);

  return {
    name: adapter.name,
    type: "adapter",
    description: `${adapter.domain} ${adapter.category} adapter`,
    files,
    dependencies: {},
    peerDependencies: {},
  };
}

export async function discoverBridges(
  registryRoot: string,
): Promise<BridgeMeta[]> {
  const bridgesDir = join(registryRoot, "bridges");
  const results: BridgeMeta[] = [];

  try {
    const entries = await readdir(bridgesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Read bridge.json manifest for metadata
      let sourceDomain: string | undefined;
      let targetDomain: string | undefined;
      let events: string[] | undefined;
      let dependencies: string[];

      try {
        const manifestPath = join(bridgesDir, entry.name, "bridge.json");
        const raw = await readFile(manifestPath, "utf-8");
        const manifest = JSON.parse(raw) as {
          sourceDomain?: string;
          targetDomain?: string;
          events?: string[];
        };
        sourceDomain = manifest.sourceDomain;
        targetDomain = manifest.targetDomain;
        events = Array.isArray(manifest.events) ? manifest.events : undefined;
        dependencies = [sourceDomain, targetDomain].filter(
          (x): x is string => !!x,
        );
      } catch {
        console.warn(`[generate] Bridge "${entry.name}" has no valid bridge.json — skipping metadata`);
        dependencies = [];
      }

      results.push({
        name: entry.name,
        path: join(bridgesDir, entry.name),
        dependencies,
        sourceDomain,
        targetDomain,
        events,
      });
    }
  } catch {
    // no bridges directory
  }

  return results;
}

export async function generateBridgeItemJson(
  bridge: BridgeMeta,
  resultTs: string,
): Promise<Record<string, unknown>> {
  const files = await readAllFiles(bridge.path, bridge.path);

  // Inject shared/result.ts if not already present
  if (!files.some((f) => f.path === "shared/result.ts")) {
    files.push({ path: "shared/result.ts", type: "source", content: resultTs });
  }

  return {
    name: bridge.name,
    type: "bridge",
    description: `Bridge connecting ${bridge.dependencies.join(" and ")}`,
    files,
    dependencies: bridge.dependencies,
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
  adapters: Array<Record<string, unknown>>,
  bridges: Array<Record<string, unknown>> = [],
  skills: Array<Record<string, unknown>> = [],
): Promise<Record<string, unknown>> {
  return {
    name: "backcap-registry",
    version: "1.0.0",
    description: "Official Backcap domain registry",
    items: [...domains, ...adapters, ...bridges, ...skills],
  };
}
