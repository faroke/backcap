import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { defineCommand } from "citty";
import * as clack from "@clack/prompts";
import { configExists, loadConfig } from "../config/loader.js";
import { fail } from "../ui/prompts.js";

interface BridgeManifest {
  name: string;
  sourceCapability: string;
  targetCapability: string;
  events: string[];
  version: string;
}

async function discoverLocalBridgeManifests(
  bridgesDir: string,
): Promise<BridgeManifest[]> {
  const manifests: BridgeManifest[] = [];

  try {
    const entries = await readdir(bridgesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = join(bridgesDir, entry.name, "bridge.json");
      try {
        const raw = await readFile(manifestPath, "utf-8");
        const manifest = JSON.parse(raw) as Partial<BridgeManifest>;
        if (!manifest.name || !manifest.sourceCapability || !manifest.targetCapability || !Array.isArray(manifest.events)) {
          console.warn(`[bridges] Skipping ${entry.name}: bridge.json missing required fields`);
          continue;
        }
        manifests.push(manifest as BridgeManifest);
      } catch {
        console.warn(`[bridges] Skipping ${entry.name}: could not read bridge.json`);
      }
    }
  } catch {
    // bridges directory doesn't exist
  }

  return manifests;
}

export default defineCommand({
  meta: {
    name: "bridges",
    description: "List available bridges between installed capabilities",
  },
  async run() {
    const cwd = process.cwd();
    clack.intro("backcap bridges");

    if (!(await configExists(cwd))) {
      fail("No backcap.json found. Run `backcap init` first.");
      return;
    }

    const configResult = await loadConfig(cwd);
    if (configResult.isFail()) {
      fail(configResult.unwrapError().message);
      return;
    }

    const config = configResult.unwrap();
    const bridgesDir = join(cwd, config.paths.bridges);
    const installedBridgeNames = new Set(
      (config.installed?.bridges ?? []).map((b) => b.name),
    );

    const manifests = await discoverLocalBridgeManifests(bridgesDir);

    if (manifests.length === 0) {
      clack.log.info("No bridge manifests found. Run `backcap add <bridge>` to install bridges.");
      clack.outro("No bridges available.");
      return;
    }

    const lines = manifests.map((m) => {
      const status = installedBridgeNames.has(m.name) ? "installed" : "available";
      return `  ${m.name}\n    Source: ${m.sourceCapability} | Target: ${m.targetCapability}\n    Events: ${m.events.join(", ")} | Status: ${status}`;
    });

    clack.note(lines.join("\n\n"), "Bridges");

    clack.outro(`${manifests.length} bridge(s) found.`);
  },
});
