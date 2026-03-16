import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import { normalize, join } from "pathe";
import { registryItemSchema } from "@backcap/shared/schemas/registry-item";
import { configExists, loadConfig } from "../config/loader.js";
import { detectAdapters } from "../lib/detect-adapters.js";
import { detectPM } from "../lib/detect-pm.js";
import { writeCapabilityFiles } from "../lib/write-capability.js";
import { installDeps } from "../lib/install-deps.js";
import { updateConfig } from "../lib/update-config.js";
import { detectConflicts } from "../installer/conflict-detector.js";
import { renderConflictSummary, renderDetailedDiffs } from "../installer/diff-renderer.js";
import {
  promptAdapterSelection,
  promptInstallConfirm,
  promptOverwriteDir,
  promptConflictResolution,
  promptNewPath,
} from "../lib/add-prompts.js";
import { intro, outro, fail } from "../ui/prompts.js";
import { log } from "../utils/logger.js";
import { ConflictDetectionError } from "../errors/conflict-detection.error.js";

const DEFAULT_REGISTRY_URL = "https://backcap.dev";

export default defineCommand({
  meta: {
    name: "add",
    description: "Install a capability from the registry",
  },
  args: {
    capability: {
      type: "positional",
      required: true,
      description: "Capability name to install",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const capabilityName = args.capability;
    intro();

    // Load config
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

    // Fetch capability item JSON
    log.info(`Fetching ${capabilityName}...`);
    let itemData: unknown;
    try {
      itemData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/${capabilityName}.json`, {
        timeout: 5000,
      });
    } catch {
      fail(`Could not fetch capability "${capabilityName}" from registry.`);
      return;
    }

    const parsed = registryItemSchema.safeParse(itemData);
    if (!parsed.success) {
      fail("Invalid capability data received from registry.");
      return;
    }

    const item = parsed.data;
    const itemVersion = (item as Record<string, unknown>).version as string | undefined;

    // Detect adapters from project dependencies
    const availableAdapters = await detectAdapters(cwd, capabilityName);
    let selectedAdapters: string[] = [];

    if (availableAdapters.length > 0) {
      selectedAdapters = await promptAdapterSelection(
        availableAdapters.map((a) => ({ name: a.name, category: a.category })),
        availableAdapters.filter((a) => a.detected).map((a) => a.name),
      );
    }

    const files = item.files as Array<{ path: string; content?: string }>;
    const filesToWrite = files
      .filter((f): f is { path: string; content: string } => typeof f.content === "string");

    const markers = {
      capabilities_path: config.paths.capabilities,
      adapters_path: config.paths.adapters,
      bridges_path: config.paths.bridges,
      skills_path: config.paths.skills,
    };

    // Conflict detection for capability files
    let capRoot = normalize(join(cwd, config.paths.capabilities, capabilityName));

    const incomingFiles = filesToWrite.map((f) => ({
      relativePath: f.path,
      content: f.content,
    }));

    let resolved = false;
    while (!resolved) {
      let report;
      try {
        report = await detectConflicts(capRoot, incomingFiles);
      } catch (err) {
        if (err instanceof ConflictDetectionError) {
          fail(`Conflict detection failed for ${err.filePath}: ${err.message}\n${err.suggestion}`);
          return;
        }
        throw err;
      }

      // All identical — nothing to do
      if (report.files.every((f) => f.status === "identical")) {
        log.info("All files are identical. No changes needed.");
        outro("Nothing to update.");
        return;
      }

      // No conflicts — proceed directly
      if (!report.hasConflicts) {
        resolved = true;
        break;
      }

      // Show conflict summary and prompt
      renderConflictSummary(report);

      const action = await promptConflictResolution();

      if (action === "abort") {
        outro("Installation cancelled. No files were written.");
        return;
      }

      if (action === "different_path") {
        const newPath = await promptNewPath();
        capRoot = normalize(join(cwd, newPath, capabilityName));
        continue;
      }

      // compare_and_continue
      renderDetailedDiffs(report);
      resolved = true;
    }

    // Confirm
    const confirmed = await promptInstallConfirm(capabilityName);
    if (!confirmed) {
      outro("Installation cancelled.");
      return;
    }

    // Write capability files
    await writeCapabilityFiles(filesToWrite, { capabilityRoot: capRoot, markers });
    log.success(`Capability files written to ${capRoot}`);

    // Fetch and write adapter files
    for (const adapterName of selectedAdapters) {
      log.info(`Fetching adapter ${adapterName}...`);
      try {
        const adapterData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/${adapterName}.json`, {
          timeout: 5000,
        });
        const adapterParsed = registryItemSchema.safeParse(adapterData);
        if (!adapterParsed.success) {
          log.warn(`Invalid adapter data for "${adapterName}", skipping.`);
          continue;
        }

        const adapterItem = adapterParsed.data;
        const adapterFiles = (adapterItem.files as Array<{ path: string; content?: string }>)
          .filter((f): f is { path: string; content: string } => typeof f.content === "string");

        // Derive category from adapter name (e.g., "auth-prisma" → prisma → persistence)
        const adapterType = adapterName.replace(`${capabilityName}-`, "");
        const category = adapterType === "prisma" ? "persistence" : "http";
        const adapterRoot = normalize(join(cwd, config.paths.adapters, category, adapterType, capabilityName));

        await writeCapabilityFiles(adapterFiles, { capabilityRoot: adapterRoot, markers });
        log.success(`Adapter files written to ${adapterRoot}`);
      } catch {
        log.warn(`Could not fetch adapter "${adapterName}", skipping.`);
      }
    }

    // Install npm deps
    const pm = detectPM(cwd);
    const npmDeps = item.dependencies ? Object.keys(item.dependencies) : [];
    const devDeps = item.peerDependencies ? Object.keys(item.peerDependencies) : [];

    if (npmDeps.length > 0) {
      log.info(`Installing dependencies: ${npmDeps.join(", ")}`);
      await installDeps(pm, npmDeps, cwd);
    }
    if (devDeps.length > 0) {
      log.info(`Installing dev dependencies: ${devDeps.join(", ")}`);
      await installDeps(pm, devDeps, cwd, true);
    }

    // Update backcap.json
    const version = itemVersion ?? "1.0.0";
    await updateConfig(cwd, {
      name: capabilityName,
      version,
      adapters: selectedAdapters,
    });

    // Success message with next steps
    const lines = [
      `${capabilityName} v${version} installed successfully!`,
      "",
      `  Capability: ${capRoot}`,
    ];
    if (selectedAdapters.length > 0) {
      lines.push(`  Adapters:   ${selectedAdapters.join(", ")}`);
    }
    lines.push("", "  Next steps:");
    lines.push(`  1. Review the installed files in ${config.paths.capabilities}/${capabilityName}/`);
    lines.push("  2. Run the test suite to verify: npx vitest run");
    lines.push("  3. Check available bridges: backcap bridges");
    outro(lines.join("\n"));
  },
});
