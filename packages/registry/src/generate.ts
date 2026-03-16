import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "pathe";
import type { CapabilityMeta, AdapterMeta, BridgeMeta } from "./types.js";

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

export async function discoverCapabilities(
  registryRoot: string,
): Promise<CapabilityMeta[]> {
  const capDir = join(registryRoot, "capabilities");
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
      const capabilities = await readdir(categoryPath, { withFileTypes: true });
      for (const cap of capabilities) {
        if (!cap.isDirectory()) continue;
        results.push({
          name: `${cap.name}-${cat.name}`,
          path: join(categoryPath, cap.name),
          capability: cap.name,
          category: cat.name === "prisma" ? "persistence" : "http",
        });
      }
    }
  } catch {
    // no adapters directory
  }

  return results;
}

export async function generateCapabilityItemJson(
  cap: CapabilityMeta,
  resultTs: string,
): Promise<Record<string, unknown>> {
  const files = await readAllFiles(cap.path, cap.path);

  // Inject shared/result.ts if not already present
  if (!files.some((f) => f.path === "shared/result.ts")) {
    files.push({ path: "shared/result.ts", type: "source", content: resultTs });
  }

  return {
    name: cap.name,
    type: "capability",
    description: `${cap.name} capability`,
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
    description: `${adapter.capability} ${adapter.category} adapter`,
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
      // Parse dependencies from bridge name (e.g., "auth-notifications" → ["auth", "notifications"])
      const parts = entry.name.split("-");
      results.push({
        name: entry.name,
        path: join(bridgesDir, entry.name),
        dependencies: parts,
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
    templateMarkers: ["{{capabilities_path}}"],
  };
}

export async function generateRegistryCatalog(
  capabilities: Array<Record<string, unknown>>,
  adapters: Array<Record<string, unknown>>,
  bridges: Array<Record<string, unknown>> = [],
): Promise<Record<string, unknown>> {
  return {
    name: "backcap-registry",
    version: "1.0.0",
    description: "Official Backcap capability registry",
    items: [...capabilities, ...adapters, ...bridges],
  };
}
