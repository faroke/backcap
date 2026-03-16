import { defineCommand } from "citty";
import { detectFramework } from "../detection/framework.js";
import { detectPackageManager } from "../detection/package-manager.js";
import { configExists, loadConfig, writeConfig } from "../config/loader.js";
import { buildDefaultConfig } from "../config/defaults.js";
import {
  intro,
  outro,
  fail,
  promptFramework,
  promptPackageManager,
  promptOverwriteConfirm,
} from "../ui/prompts.js";
import { log } from "../utils/logger.js";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize a Backcap project in the current directory",
  },
  args: {
    yes: {
      type: "boolean",
      alias: "y",
      default: false,
      description: "Skip all prompts (non-interactive mode)",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    intro();

    // Detect framework
    const frameworkResult = await detectFramework(cwd);
    let framework: string;
    if (frameworkResult.isOk()) {
      framework = frameworkResult.unwrap();
    } else if (args.yes) {
      fail("Cannot detect framework. Run without --yes or create backcap.json manually.");
      return;
    } else {
      framework = await promptFramework();
    }

    if (frameworkResult.isOk()) {
      log.info(`Detected framework: ${framework}`);
    }

    // Detect package manager
    const pmResult = await detectPackageManager(cwd);
    let pm: string;
    if (pmResult.isOk()) {
      pm = pmResult.unwrap();
    } else if (args.yes) {
      fail("Cannot detect package manager. Run without --yes or create backcap.json manually.");
      return;
    } else {
      pm = await promptPackageManager();
    }

    if (pmResult.isOk()) {
      log.info(`Detected package manager: ${pm}`);
    }

    // Check for existing config
    if (await configExists(cwd)) {
      const existingResult = await loadConfig(cwd);

      if (existingResult.isOk()) {
        if (!args.yes) {
          const shouldOverwrite = await promptOverwriteConfirm(
            existingResult.unwrap(),
          );
          if (!shouldOverwrite) {
            outro("Kept existing backcap.json unchanged.");
            return;
          }
        }
      }
    }

    // Build and write config
    const config = buildDefaultConfig(framework, pm);
    const writeResult = await writeConfig(config, cwd);

    if (writeResult.isFail()) {
      fail(writeResult.unwrapError().message);
      return;
    }

    outro("backcap.json created successfully!");
  },
});
