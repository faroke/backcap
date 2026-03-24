import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Create an isolated temp directory for a test.
 */
export async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "backcap-e2e-"));
}

/**
 * Remove the temp directory after test.
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

/**
 * Scaffold a minimal project in a temp dir for testing.
 */
export async function scaffoldProject(
  dir: string,
  options: {
    packageJson?: Record<string, unknown>;
    tsconfig?: Record<string, unknown>;
    backcapJson?: Record<string, unknown>;
    lockfile?: "npm" | "pnpm" | "yarn" | "bun";
  } = {},
): Promise<void> {
  const {
    packageJson = { name: "test-project", dependencies: { express: "^4.18.0" } },
    tsconfig = { compilerOptions: { strict: true } },
    backcapJson,
    lockfile = "npm",
  } = options;

  await writeFile(join(dir, "package.json"), JSON.stringify(packageJson, null, 2));
  await writeFile(join(dir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  const lockfileMap: Record<string, string> = {
    npm: "package-lock.json",
    pnpm: "pnpm-lock.yaml",
    yarn: "yarn.lock",
    bun: "bun.lockb",
  };
  await writeFile(join(dir, lockfileMap[lockfile]), "");

  if (backcapJson) {
    await writeFile(join(dir, "backcap.json"), JSON.stringify(backcapJson, null, 2));
  }
}

/**
 * Read a JSON file from a path.
 */
export async function readJson(filePath: string): Promise<unknown> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Check if a file exists (without throwing).
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}
