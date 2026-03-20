import type { FrameworkId } from "../detection/framework.js";
import type { PackageManagerId } from "../detection/package-manager.js";

export interface BackcapConfig {
  framework: string;
  packageManager: string;
  paths: {
    domains: string;
    adapters: string;
    bridges: string;
    skills: string;
    shared: string;
  };
  alias: string;
}

export function buildDefaultConfig(
  framework: FrameworkId,
  pm: PackageManagerId,
): BackcapConfig {
  return {
    framework,
    packageManager: pm,
    paths: {
      domains: "domains",
      adapters: "adapters",
      bridges: "bridges",
      skills: ".claude/skills",
      shared: "src/shared",
    },
    alias: "@domains",
  };
}
