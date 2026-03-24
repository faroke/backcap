import { defineCommand } from "citty";
import { ofetch } from "ofetch";
import { normalize, join } from "pathe";
import { registryItemSchema } from "@backcap/shared/schemas/registry-item";
import { configExists, loadConfig } from "../config/loader.js";
import { detectPM } from "../lib/detect-pm.js";
import { writeDomainFiles } from "../lib/write-domain.js";
import { installDeps } from "../lib/install-deps.js";
import { detectConflicts } from "../installer/conflict-detector.js";
import { renderConflictSummary, renderDetailedDiffs } from "../installer/diff-renderer.js";
import { selectiveInstall, InstallCancelledError } from "../installer/selective-installer.js";
import { resolveSkillFiles } from "../installer/skill-resolver.js";
import { installSkill, extractSkillFiles, resolveSkillsPath } from "../installer/skill-installer.js";
import { reportInstallResult } from "../installer/install-reporter.js";
import {
  promptInstallConfirm,
  promptConflictResolution,
  promptNewPath,
  promptSkillConflict,
} from "../lib/add-prompts.js";
import { intro, outro, fail } from "../ui/prompts.js";
import { log } from "../utils/logger.js";
import { ConflictDetectionError } from "../errors/conflict-detection.error.js";
import { FileWriteError } from "../installer/file-writer.js";

const DEFAULT_REGISTRY_URL = "https://faroke.github.io/backcap";

export default defineCommand({
  meta: {
    name: "add",
    description: "Install a domain from the registry",
  },
  args: {
    domain: {
      type: "positional",
      required: true,
      description: "Domain name to install",
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
    const domainName = args.domain;
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

    // Fetch item JSON
    log.info(`Fetching ${domainName}...`);
    let itemData: unknown;
    try {
      itemData = await ofetch(`${DEFAULT_REGISTRY_URL}/dist/${domainName}.json`, {
        timeout: 5000,
      });
    } catch {
      fail(`Could not fetch "${domainName}" from registry.`);
      return;
    }

    const parsed = registryItemSchema.safeParse(itemData);
    if (!parsed.success) {
      fail("Invalid data received from registry.");
      return;
    }

    const item = parsed.data;
    const itemVersion = (item as Record<string, unknown>).version as string | undefined;

    // Resolve skill files from domain JSON
    const skillFiles = resolveSkillFiles(item as { files?: Array<{ path: string; content?: string }>; skills?: string[] });

    const files = item.files as Array<{ path: string; content?: string }>;
    const filesToWrite = files
      .filter((f): f is { path: string; content: string } => typeof f.content === "string");

    // Conflict detection for domain files
    let capRoot = normalize(join(cwd, config.paths.domains, domainName));

    let useSelectiveInstall = false;
    let resolved = false;
    while (!resolved) {
      const incomingFiles = filesToWrite.map((f) => ({
        relativePath: f.path,
        content: f.content,
      }));

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
        capRoot = normalize(join(cwd, newPath, domainName));
        continue;
      }

      if (action === "selective") {
        // Selective installation — let user pick files
        try {
          const installResult = await selectiveInstall(report, skillFiles);

          // Filter filesToWrite to only selected + always-installed files
          const selectedPaths = new Set([...installResult.installed, ...installResult.alwaysInstalled]);
          const selectedFiles = filesToWrite.filter((f) => selectedPaths.has(f.path));

          await writeDomainFiles(selectedFiles, { domainRoot: capRoot });

          reportInstallResult(installResult);
          useSelectiveInstall = true;
          resolved = true;
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
        const confirmed = await promptInstallConfirm(domainName);
        if (!confirmed) {
          outro("Installation cancelled.");
          return;
        }
      }

      // Write all domain files
      await writeDomainFiles(filesToWrite, { domainRoot: capRoot });
      log.success(`Domain files written to ${capRoot}`);
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

      const templateValues = {
        domains_path: config.paths.domains,
        skills_path: config.paths.skills,
        shared_config_path: config.paths.shared ?? "src/shared",
      };

      await installSkill({
        skillsPath,
        domainName,
        skillFiles: capSkillFiles,
        coreSkillFiles,
        templateValues,
        onConflict: args.yes ? async () => "overwrite" as const : promptSkillConflict,
      });
      log.success(`Skill installed to ${skillsPath}/backcap-${domainName}/`);
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
        `${domainName} v${version} installed successfully!`,
        "",
        `  Domain: ${capRoot}`,
        "",
        "  Next steps:",
        `  1. Review the installed files in ${config.paths.domains}/${domainName}/`,
        "  2. Implement your adapters on the exposed ports",
        "  3. Run the test suite to verify: npx vitest run",
      ];
      outro(lines.join("\n"));
    }
  },
});
