import * as clack from "@clack/prompts";
import type { FrameworkId } from "../detection/framework.js";
import type { PackageManagerId } from "../detection/package-manager.js";
import type { BackcapConfig } from "../config/defaults.js";

export function intro(): void {
  clack.intro("backcap init");
}

export function outro(msg: string): void {
  clack.outro(msg);
}

export function fail(msg: string): void {
  clack.cancel(msg);
  process.exit(1);
}

export async function promptFramework(): Promise<FrameworkId> {
  const value = await clack.select({
    message: "Which framework are you using?",
    options: [
      { value: "nextjs" as const, label: "Next.js" },
      { value: "express" as const, label: "Express" },
      { value: "fastify" as const, label: "Fastify" },
      { value: "nestjs" as const, label: "NestJS" },
      { value: "hono" as const, label: "Hono" },
    ],
  });

  if (clack.isCancel(value)) {
    process.exit(0);
  }

  return value as FrameworkId;
}

export async function promptPackageManager(): Promise<PackageManagerId> {
  const value = await clack.select({
    message: "Which package manager are you using?",
    options: [
      { value: "npm" as const, label: "npm" },
      { value: "pnpm" as const, label: "pnpm" },
      { value: "yarn" as const, label: "yarn" },
      { value: "bun" as const, label: "bun" },
    ],
  });

  if (clack.isCancel(value)) {
    process.exit(0);
  }

  return value as PackageManagerId;
}

export async function promptOverwriteConfirm(
  existingConfig: BackcapConfig,
): Promise<boolean> {
  const value = await clack.confirm({
    message: `A backcap.json already exists (framework: ${existingConfig.framework}, packageManager: ${existingConfig.packageManager}). Overwrite?`,
  });

  if (clack.isCancel(value)) {
    process.exit(0);
  }

  return value;
}
