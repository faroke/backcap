import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import * as clack from "@clack/prompts";
import { configExists, loadConfig } from "../config/loader.js";
import { fail } from "../ui/prompts.js";

const DEFAULT_REGISTRY_URL = "https://backcap.dev";

interface BridgeCatalogEntry {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
}

interface BridgeCatalog {
  bridges: BridgeCatalogEntry[];
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
    const installedCaps = config.installed?.capabilities ?? [];
    const installedCapNames = new Set(installedCaps.map((c) => c.name));

    if (installedCapNames.size === 0) {
      clack.log.info("No capabilities installed yet. Run `backcap add <capability>` to get started.");
      clack.outro("No bridges available.");
      return;
    }

    // Fetch bridge catalog
    let catalog: BridgeCatalog;
    try {
      catalog = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/bridges/index.json`, {
        timeout: 5000,
      });
    } catch {
      fail("Could not fetch bridge catalog from registry.");
      return;
    }

    const compatible = catalog.bridges.filter((b) =>
      b.dependencies.every((dep) => installedCapNames.has(dep)),
    );

    if (compatible.length === 0) {
      clack.log.info("No compatible bridges found for your installed capabilities.");
      clack.outro("Install more capabilities to unlock bridges.");
      return;
    }

    const installedBridges = new Set(
      (config.installed?.bridges ?? []).map((b) => b.name),
    );

    const lines = compatible.map((b) => {
      const status = installedBridges.has(b.name) ? "installed" : "available";
      return `  ${b.name} — ${b.description}\n    Dependencies: ${b.dependencies.join(", ")} | Status: ${status}`;
    });

    clack.note(lines.join("\n\n"), "Available Bridges");

    const availableCount = compatible.filter((b) => !installedBridges.has(b.name)).length;
    if (availableCount > 0) {
      clack.log.info(`Run \`backcap add <bridge-name>\` to install a bridge.`);
    }
    clack.outro(`${compatible.length} bridge(s) found.`);
  },
});
