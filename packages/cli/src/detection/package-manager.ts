import { stat } from "node:fs/promises";
import { dirname, join, parse } from "pathe";
import { Result } from "@backcap/shared/result";
import { DetectionError } from "../errors/config.error.js";

export type PackageManagerId = "npm" | "pnpm" | "yarn" | "bun";

const LOCKFILE_MAP: Array<{ file: string; id: PackageManagerId }> = [
  { file: "bun.lockb", id: "bun" },
  { file: "pnpm-lock.yaml", id: "pnpm" },
  { file: "yarn.lock", id: "yarn" },
  { file: "package-lock.json", id: "npm" },
];

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function detectPackageManager(
  cwd: string,
): Promise<Result<PackageManagerId, DetectionError>> {
  let dir = cwd;

  while (true) {
    for (const { file, id } of LOCKFILE_MAP) {
      if (await fileExists(join(dir, file))) {
        return Result.ok(id);
      }
    }

    const parent = dirname(dir);
    if (parent === dir || parent === parse(dir).root) break;
    dir = parent;
  }

  return Result.fail(new DetectionError("packageManager"));
}
