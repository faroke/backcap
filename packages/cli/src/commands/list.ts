import { defineCommand } from "citty";
import { fetchRegistry } from "../lib/registry-fetch.js";
import { renderCapabilityTable } from "../lib/render-table.js";
import { configExists, loadConfig } from "../config/loader.js";
import { log } from "../utils/logger.js";

const DEFAULT_REGISTRY_URL = "https://backcap.dev/registry.json";

export default defineCommand({
  meta: {
    name: "list",
    description: "Browse available capabilities from the registry",
  },
  async run() {
    const cwd = process.cwd();
    let installed = new Set<string>();
    let registryUrl = DEFAULT_REGISTRY_URL;

    if (await configExists(cwd)) {
      const configResult = await loadConfig(cwd);
      if (configResult.isOk()) {
        const config = configResult.unwrap();
        const caps = config.installed?.capabilities ?? [];
        installed = new Set(caps.map((c) => c.name));
      }
    } else {
      log.info("Run `backcap init` to configure your project.");
    }

    log.start("Fetching registry...");

    try {
      const registry = await fetchRegistry(registryUrl);
      const items = (registry as { items?: Array<{ name: string; description: string; type: string }> }).items ?? [];
      log.success("Registry loaded");

      const table = renderCapabilityTable(items, installed);
      process.stdout.write(table);
    } catch (e) {
      log.error((e as Error).message);
      process.exit(1);
    }
  },
});
