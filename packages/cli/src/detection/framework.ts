import { readPackageJSON } from "pkg-types";
import { Result } from "@backcap/shared/result";
import { DetectionError } from "../errors/config.error.js";

export type FrameworkId = "nextjs" | "express" | "fastify" | "nestjs" | "hono";

const FRAMEWORK_MAP: Array<{ pkg: string; id: FrameworkId }> = [
  { pkg: "next", id: "nextjs" },
  { pkg: "@nestjs/core", id: "nestjs" },
  { pkg: "fastify", id: "fastify" },
  { pkg: "hono", id: "hono" },
  { pkg: "express", id: "express" },
];

export async function detectFramework(
  cwd: string,
): Promise<Result<FrameworkId, DetectionError>> {
  try {
    const pkg = await readPackageJSON(cwd);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const { pkg: name, id } of FRAMEWORK_MAP) {
      if (name in deps) {
        return Result.ok(id);
      }
    }
  } catch {
    // package.json not found or unreadable
  }

  return Result.fail(new DetectionError("framework"));
}
