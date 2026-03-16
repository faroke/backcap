import type { FrameworkId } from "../detection/framework.js";
import type { PackageManagerId } from "../detection/package-manager.js";

export interface InstalledCapability {
  name: string;
  version: string;
  adapters: string[];
  partial?: boolean;
}

export interface InstalledBridge {
  name: string;
  version: string;
}

export interface InstalledConfig {
  capabilities: InstalledCapability[];
  bridges: InstalledBridge[];
}

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
  installed: InstalledConfig;
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
      skills: ".claude/skills",
      shared: "src/shared",
    },
    installed: { capabilities: [], bridges: [] },
  };
}
