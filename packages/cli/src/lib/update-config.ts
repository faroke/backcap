import { writeFile, rename } from "node:fs/promises";
import { join } from "pathe";
import type { BackcapConfig, InstalledCapability, InstalledBridge, InstalledConfig } from "../config/defaults.js";

function ensureInstalled(config: Record<string, unknown>): InstalledConfig {
  if (!config.installed || typeof config.installed !== "object" || Array.isArray(config.installed)) {
    config.installed = { capabilities: [], bridges: [] };
  }
  const installed = config.installed as InstalledConfig;
  if (!Array.isArray(installed.capabilities)) {
    installed.capabilities = [];
  }
  if (!Array.isArray(installed.bridges)) {
    installed.bridges = [];
  }
  return installed;
}

export async function updateConfigCapability(
  cwd: string,
  entry: InstalledCapability,
): Promise<void> {
  const configPath = join(cwd, "backcap.json");
  const { readFile } = await import("node:fs/promises");

  const raw = await readFile(configPath, "utf-8");
  const config = JSON.parse(raw) as Record<string, unknown>;
  const installed = ensureInstalled(config);

  const capEntry: InstalledCapability = {
    name: entry.name,
    version: entry.version,
    adapters: entry.adapters,
  };

  if (entry.partial) {
    capEntry.partial = true;
  }

  installed.capabilities.push(capEntry);

  const tmpPath = configPath + ".tmp";
  await writeFile(tmpPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  await rename(tmpPath, configPath);
}

export async function updateConfigBridge(
  cwd: string,
  entry: InstalledBridge,
): Promise<void> {
  const configPath = join(cwd, "backcap.json");
  const { readFile } = await import("node:fs/promises");

  const raw = await readFile(configPath, "utf-8");
  const config = JSON.parse(raw) as Record<string, unknown>;
  const installed = ensureInstalled(config);

  installed.bridges.push({ name: entry.name, version: entry.version });

  const tmpPath = configPath + ".tmp";
  await writeFile(tmpPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  await rename(tmpPath, configPath);
}

/** @deprecated Use updateConfigCapability instead */
export async function updateConfig(
  cwd: string,
  capabilityEntry: { name: string; version: string; adapters: string[]; partial?: boolean },
): Promise<void> {
  return updateConfigCapability(cwd, capabilityEntry);
}
