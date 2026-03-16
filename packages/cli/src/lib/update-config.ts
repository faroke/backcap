import { writeFile, rename } from "node:fs/promises";
import { join } from "pathe";
import type { BackcapConfig } from "../config/defaults.js";

export async function updateConfig(
  cwd: string,
  capabilityEntry: { name: string; version: string; adapters: string[] },
): Promise<void> {
  const configPath = join(cwd, "backcap.json");
  const { readFile } = await import("node:fs/promises");

  const raw = await readFile(configPath, "utf-8");
  const config = JSON.parse(raw) as BackcapConfig & {
    installed?: Array<{ name: string; version: string; adapters: string[] }>;
  };

  if (!Array.isArray(config.installed)) {
    (config as Record<string, unknown>).installed = [];
  }

  (config.installed as Array<{ name: string; version: string; adapters: string[] }>).push(
    capabilityEntry,
  );

  // Atomic write
  const tmpPath = configPath + ".tmp";
  await writeFile(tmpPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  await rename(tmpPath, configPath);
}
