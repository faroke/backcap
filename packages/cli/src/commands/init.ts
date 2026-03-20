import { readFile, writeFile, stat } from "node:fs/promises";
import { join } from "pathe";
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

async function tsconfigExists(cwd: string): Promise<boolean> {
  try {
    await stat(join(cwd, "tsconfig.json"));
    return true;
  } catch {
    return false;
  }
}

function stripJsonComments(text: string): string {
  return text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

async function injectTsconfigAlias(cwd: string, alias: string, domainsPath: string): Promise<void> {
  const tsconfigPath = join(cwd, "tsconfig.json");
  const raw = await readFile(tsconfigPath, "utf-8");
  const tsconfig = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;

  if (!tsconfig.compilerOptions || typeof tsconfig.compilerOptions !== "object") {
    tsconfig.compilerOptions = {};
  }

  const compilerOptions = tsconfig.compilerOptions as Record<string, unknown>;

  if (!compilerOptions.paths || typeof compilerOptions.paths !== "object") {
    compilerOptions.paths = {};
  }

  const paths = compilerOptions.paths as Record<string, string[]>;
  paths[`${alias}/*`] = [`${domainsPath}/*`];

  await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n", "utf-8");
}

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

    // Check tsconfig.json prerequisite
    if (!(await tsconfigExists(cwd))) {
      fail("tsconfig.json not found. Backcap requires a TypeScript project with tsconfig.json.");
      return;
    }

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

    // Inject alias into tsconfig.json
    try {
      await injectTsconfigAlias(cwd, config.alias, config.paths.domains);
    } catch (err) {
      fail(`Failed to update tsconfig.json: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    outro("backcap.json created successfully!");
  },
});
