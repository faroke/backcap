import { readFile, writeFile, stat } from "node:fs/promises";
import { join, normalize } from "pathe";
import { configSchema } from "@backcap/shared/schemas/config";
import { Result } from "@backcap/shared/result";
import { ConfigError, ValidationError } from "../errors/config.error.js";
import type { BackcapConfig } from "./defaults.js";

export async function configExists(cwd: string): Promise<boolean> {
  try {
    await stat(join(cwd, "backcap.json"));
    return true;
  } catch {
    return false;
  }
}

export async function loadConfig(
  cwd: string,
): Promise<Result<BackcapConfig, ConfigError>> {
  try {
    const raw = await readFile(join(cwd, "backcap.json"), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const result = configSchema.safeParse(parsed);

    if (!result.success) {
      return Result.fail(new ValidationError(result.error));
    }

    return Result.ok(result.data as BackcapConfig);
  } catch (err) {
    return Result.fail(
      new ConfigError(
        `Failed to load backcap.json: ${err instanceof Error ? err.message : String(err)}`,
        "LOAD_ERROR",
        err,
      ),
    );
  }
}

function normalizePaths(config: BackcapConfig): BackcapConfig {
  return {
    ...config,
    paths: {
      domains: normalize(config.paths.domains),
      adapters: normalize(config.paths.adapters),
      bridges: normalize(config.paths.bridges),
      skills: normalize(config.paths.skills),
      shared: normalize(config.paths.shared),
    },
  };
}

export async function writeConfig(
  config: BackcapConfig,
  cwd: string,
): Promise<Result<void, ConfigError>> {
  try {
    const normalized = normalizePaths(config);
    const content = JSON.stringify(normalized, null, 2) + "\n";
    await writeFile(join(cwd, "backcap.json"), content, "utf-8");
    return Result.ok(undefined);
  } catch (err) {
    return Result.fail(
      new ConfigError(
        `Failed to write backcap.json: ${err instanceof Error ? err.message : String(err)}`,
        "WRITE_ERROR",
        err,
      ),
    );
  }
}
