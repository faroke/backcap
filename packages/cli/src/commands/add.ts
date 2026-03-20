import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import { normalize, join } from "pathe";
import { registryItemSchema } from "@backcap/shared/schemas/registry-item";
import { configExists, loadConfig } from "../config/loader.js";
import { detectAdapters } from "../lib/detect-adapters.js";
import { detectPM } from "../lib/detect-pm.js";
import { writeCapabilityFiles, resolveFileMarkers } from "../lib/write-capability.js";
import { installDeps } from "../lib/install-deps.js";
import { updateConfigCapability, updateConfigBridge } from "../lib/update-config.js";
import { detectConflicts } from "../installer/conflict-detector.js";
import { renderConflictSummary, renderDetailedDiffs } from "../installer/diff-renderer.js";
import { selectiveInstall, InstallCancelledError } from "../installer/selective-installer.js";
import { resolveSkillFiles } from "../installer/skill-resolver.js";
import { installSkill, extractSkillFiles, resolveSkillsPath } from "../installer/skill-installer.js";
import { reportInstallResult } from "../installer/install-reporter.js";
import {
  promptAdapterSelection,
  promptInstallConfirm,
  promptConflictResolution,
  promptNewPath,
  promptSkillConflict,
} from "../lib/add-prompts.js";
import { intro, outro, fail } from "../ui/prompts.js";
import { log } from "../utils/logger.js";
import { ConflictDetectionError } from "../errors/conflict-detection.error.js";
import { FileWriteError } from "../installer/file-writer.js";
import { MissingDependencyError } from "../errors/bridge.error.js";

const DEFAULT_REGISTRY_URL = "https://faroke.github.io/backcap";

export default defineCommand({
  meta: {
    name: "add",
    description: "Install a capability or bridge from the registry",
  },
  args: {
    capability: {
      type: "positional",
      required: true,
      description: "Capability or bridge name to install",
    },
    yes: {
      type: "boolean",
      alias: "y",
      default: false,
      description: "Skip all prompts (non-interactive mode)",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const itemName = args.capability;
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

    // Fetch item JSON — try capability path first, then bridges
    log.info(`Fetching ${itemName}...`);
    let itemData: unknown;
    let fetchedFromBridges = false;
    try {
      itemData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/${itemName}.json`, {
        timeout: 5000,
      });
    } catch {
      // Try bridges path
      try {
        itemData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/bridges/${itemName}.json`, {
          timeout: 5000,
        });
        fetchedFromBridges = true;
      } catch {
        fail(`Could not fetch "${itemName}" from registry.`);
        return;
      }
    }

    const parsed = registryItemSchema.safeParse(itemData);
    if (!parsed.success) {
      fail("Invalid data received from registry.");
      return;
    }

    const item = parsed.data;
    const itemVersion = (item as Record<string, unknown>).version as string | undefined;
    const itemType = item.type;

    // Route to bridge installation if type is "bridge"
    if (itemType === "bridge" || fetchedFromBridges) {
      await installBridge(cwd, config, item, itemVersion, args.yes);
      return;
    }

    // --- Capability installation flow ---
    const capabilityName = itemName;

    // Resolve skill files from capability JSON
    const skillFiles = resolveSkillFiles(item as { files?: Array<{ path: string; content?: string }>; skills?: string[] });

    // Detect adapters from project dependencies
    const availableAdapters = await detectAdapters(cwd, capabilityName);
    let selectedAdapters: string[] = [];

    if (availableAdapters.length > 0) {
      if (args.yes) {
        selectedAdapters = availableAdapters.filter((a) => a.detected).map((a) => a.name);
      } else {
        selectedAdapters = await promptAdapterSelection(
          availableAdapters.map((a) => ({ name: a.name, category: a.category })),
          availableAdapters.filter((a) => a.detected).map((a) => a.name),
        );
      }
    }

    const files = item.files as Array<{ path: string; content?: string }>;
    const filesToWrite = files
      .filter((f): f is { path: string; content: string } => typeof f.content === "string");

    const markers = {
      capabilities_path: config.paths.capabilities,
      adapters_path: config.paths.adapters,
      bridges_path: config.paths.bridges,
      skills_path: config.paths.skills,
      shared_config_path: config.paths.shared ?? "src/shared",
    };

    // Conflict detection for capability files
    let capRoot = normalize(join(cwd, config.paths.capabilities, capabilityName));

    let useSelectiveInstall = false;
    let resolved = false;
    while (!resolved) {
      // Recompute markers each iteration (capRoot may change via "different_path")
      const incomingFiles = resolveFileMarkers(filesToWrite, capRoot, markers, cwd);

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

      const action = args.yes ? "compare_and_continue" : await promptConflictResolution();

      if (action === "abort") {
        outro("Installation cancelled. No files were written.");
        return;
      }

      if (action === "different_path") {
        const newPath = await promptNewPath();
        capRoot = normalize(join(cwd, newPath, capabilityName));
        continue;
      }

      if (action === "selective") {
        // Selective installation — let user pick files
        try {
          const installResult = await selectiveInstall(report, skillFiles);

          // Filter filesToWrite to only selected + always-installed files
          const selectedPaths = new Set([...installResult.installed, ...installResult.alwaysInstalled]);
          const selectedFiles = filesToWrite.filter((f) => selectedPaths.has(f.path));

          await writeCapabilityFiles(selectedFiles, { capabilityRoot: capRoot, markers, cwd });

          reportInstallResult(installResult);
          useSelectiveInstall = true;
          resolved = true;

          // Track partial install
          const version = itemVersion ?? "1.0.0";
          await updateConfigCapability(cwd, {
            name: capabilityName,
            version,
            adapters: selectedAdapters,
            partial: installResult.skipped.length > 0,
          });
        } catch (err) {
          if (err instanceof InstallCancelledError) {
            outro("Installation cancelled. No files were written.");
            return;
          }
          if (err instanceof FileWriteError) {
            fail(`File write failed for ${err.filePath}: ${err.message}\n${err.suggestion}`);
            return;
          }
          throw err;
        }
        break;
      }

      // compare_and_continue — show diffs then proceed to full install
      renderDetailedDiffs(report);
      resolved = true;
    }

    // If selective install was used, skip the normal write flow
    if (!useSelectiveInstall) {
      // Confirm
      if (!args.yes) {
        const confirmed = await promptInstallConfirm(capabilityName);
        if (!confirmed) {
          outro("Installation cancelled.");
          return;
        }
      }

      // Write all capability files
      await writeCapabilityFiles(filesToWrite, { capabilityRoot: capRoot, markers, cwd });
      log.success(`Capability files written to ${capRoot}`);

      // Update backcap.json
      const version = itemVersion ?? "1.0.0";
      await updateConfigCapability(cwd, {
        name: capabilityName,
        version,
        adapters: selectedAdapters,
      });
    }

    // Fetch and write adapter files (always, regardless of selective install)
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

        const adapterType = adapterName.replace(`${capabilityName}-`, "");
        const category = adapterType === "prisma" ? "persistence" : "http";
        const adapterRoot = normalize(join(cwd, config.paths.adapters, category, adapterType, capabilityName));

        await writeCapabilityFiles(adapterFiles, { capabilityRoot: adapterRoot, markers, cwd });
        log.success(`Adapter files written to ${adapterRoot}`);
      } catch {
        log.warn(`Could not fetch adapter "${adapterName}", skipping.`);
      }
    }

    // Install skill files
    const skillsPath = normalize(join(cwd, resolveSkillsPath(config)));
    const capSkillFiles = extractSkillFiles(files);

    if (capSkillFiles.length > 0) {
      // Fetch core skill from registry
      let coreSkillFiles: Array<{ path: string; content: string }> = [];
      try {
        const coreData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/skills/backcap-core.json`, {
          timeout: 5000,
        });
        const coreParsed = registryItemSchema.safeParse(coreData);
        if (coreParsed.success) {
          coreSkillFiles = extractSkillFiles(
            coreParsed.data.files as Array<{ path: string; content?: string; type?: string }>,
          );
        }
      } catch {
        // Core skill fetch failed — proceed without it
      }

      await installSkill({
        skillsPath,
        capabilityName,
        skillFiles: capSkillFiles,
        coreSkillFiles,
        templateValues: markers,
        onConflict: args.yes ? async () => "overwrite" as const : promptSkillConflict,
      });
      log.success(`Skill installed to ${skillsPath}/backcap-${capabilityName}/`);
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

    // Success message (only for non-selective, selective uses reportInstallResult)
    if (!useSelectiveInstall) {
      const version = itemVersion ?? "1.0.0";
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
    }
  },
});

// --- Bridge installation flow ---
async function installBridge(
  cwd: string,
  config: { paths: { capabilities: string; adapters: string; bridges: string; skills: string }; installed: { capabilities: Array<{ name: string }>; bridges: Array<{ name: string }> } },
  item: { name: string; type: string; files: Array<Record<string, unknown>>; dependencies?: Record<string, string> | string[] },
  itemVersion: string | undefined,
  yes = false,
): Promise<void> {
  const bridgeName = item.name;
  const version = itemVersion ?? "0.1.0";

  // Check if already installed
  const installedBridgeNames = new Set(config.installed.bridges.map((b) => b.name));
  if (installedBridgeNames.has(bridgeName)) {
    log.info(`Bridge "${bridgeName}" is already installed.`);
    outro("Nothing to update.");
    return;
  }

  // Validate dependencies — all required capabilities must be installed
  const requiredDeps = Array.isArray(item.dependencies)
    ? item.dependencies
    : item.dependencies ? Object.keys(item.dependencies) : [];

  if (requiredDeps.length > 0) {
    const installedCapNames = new Set(config.installed.capabilities.map((c) => c.name));
    const missing = requiredDeps.filter((dep) => !installedCapNames.has(dep));

    if (missing.length > 0) {
      const err = new MissingDependencyError(missing);
      fail(`${err.message}\n${err.suggestion}`);
      return;
    }
  }

  // Extract files to write
  const files = item.files as Array<{ path: string; content?: string }>;
  const filesToWrite = files
    .filter((f): f is { path: string; content: string } => typeof f.content === "string");

  const markers = {
    capabilities_path: config.paths.capabilities,
    adapters_path: config.paths.adapters,
    bridges_path: config.paths.bridges,
    skills_path: config.paths.skills,
    shared_config_path: config.paths.shared ?? "src/shared",
  };

  const bridgeRoot = normalize(join(cwd, config.paths.bridges, bridgeName));

  // Conflict detection — resolve markers before comparing
  const incomingFiles = resolveFileMarkers(filesToWrite, bridgeRoot, markers, cwd);

  try {
    const report = await detectConflicts(bridgeRoot, incomingFiles);

    if (report.files.every((f) => f.status === "identical")) {
      log.info("All bridge files are identical. No changes needed.");
      outro("Nothing to update.");
      return;
    }

    if (report.hasConflicts) {
      renderConflictSummary(report);
      const action = yes ? "compare_and_continue" : await promptConflictResolution(["selective", "different_path"]);
      if (action === "abort") {
        outro("Installation cancelled. No files were written.");
        return;
      }
      if (action === "compare_and_continue") {
        renderDetailedDiffs(report);
      }
    }
  } catch (err) {
    if (err instanceof ConflictDetectionError) {
      fail(`Conflict detection failed for ${err.filePath}: ${err.message}\n${err.suggestion}`);
      return;
    }
    throw err;
  }

  // Confirm installation
  if (!yes) {
    const confirmed = await promptInstallConfirm(bridgeName);
    if (!confirmed) {
      outro("Installation cancelled.");
      return;
    }
  }

  // Write bridge files
  await writeCapabilityFiles(filesToWrite, { capabilityRoot: bridgeRoot, markers, cwd });
  log.success(`Bridge files written to ${bridgeRoot}`);

  // Update config
  await updateConfigBridge(cwd, { name: bridgeName, version });

  // Success message
  const lines = [
    `Bridge ${bridgeName} v${version} installed successfully!`,
    "",
    `  Bridge: ${bridgeRoot}`,
    `  Connects: ${requiredDeps.join(" + ")}`,
    "",
    "  Next steps:",
    `  1. Review the bridge files in ${config.paths.bridges}/${bridgeName}/`,
    "  2. Wire the bridge in your application entry point",
    "  3. Run the test suite: npx vitest run",
  ];
  outro(lines.join("\n"));
}
