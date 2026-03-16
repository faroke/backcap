import { writeFile, rename } from "node:fs/promises";
import { join } from "pathe";
import type { BackcapConfig } from "../config/defaults.js";

export async function updateConfig(
  cwd: string,
  capabilityEntry: { name: string; version: string; adapters: string[]; partial?: boolean },
): Promise<void> {
  const configPath = join(cwd, "backcap.json");
  const { readFile } = await import("node:fs/promises");

  const raw = await readFile(configPath, "utf-8");
  const config = JSON.parse(raw) as BackcapConfig & {
    installed?: Array<{ name: string; version: string; adapters: string[]; partial?: boolean }>;
  };

  if (!Array.isArray(config.installed)) {
    (config as Record<string, unknown>).installed = [];
  }

  const entry: { name: string; version: string; adapters: string[]; partial?: boolean } = {
    name: capabilityEntry.name,
    version: capabilityEntry.version,
    adapters: capabilityEntry.adapters,
  };

  if (capabilityEntry.partial) {
    entry.partial = true;
  }

  (config.installed as Array<{ name: string; version: string; adapters: string[]; partial?: boolean }>).push(entry);

  // Atomic write
  const tmpPath = configPath + ".tmp";
  await writeFile(tmpPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  await rename(tmpPath, configPath);
}
