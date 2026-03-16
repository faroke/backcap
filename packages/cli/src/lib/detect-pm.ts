import { existsSync } from "node:fs";
import { join } from "pathe";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function detectPM(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

export function buildInstallCommand(
  pm: PackageManager,
  deps: string[],
  dev = false,
): string[] {
  const installCmd = { npm: "install", pnpm: "add", yarn: "add", bun: "add" }[pm];
  const devFlag = { npm: "--save-dev", pnpm: "-D", yarn: "--dev", bun: "-d" }[pm];
  return [pm, installCmd, ...(dev ? [devFlag] : []), ...deps];
}
