import type { FrameworkId } from "../detection/framework.js";
import type { PackageManagerId } from "../detection/package-manager.js";

export interface BackcapConfig {
  framework: string;
  packageManager: string;
  paths: {
    capabilities: string;
    adapters: string;
    bridges: string;
    skills: string;
    shared: string;
  };
  installed: string[];
}

export function buildDefaultConfig(
  framework: FrameworkId,
  pm: PackageManagerId,
): BackcapConfig {
  return {
    framework,
    packageManager: pm,
    paths: {
      capabilities: "src/capabilities",
      adapters: "src/adapters",
      bridges: "src/bridges",
      skills: "src/skills",
      shared: "src/shared",
    },
    installed: [],
  };
}
