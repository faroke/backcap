export type CapabilityType = "capability" | "adapter" | "bridge" | "skill";

export interface TemplateMarker {
  key: string;
  configPath: string;
}

export interface InstalledCapability {
  name: string;
  type: CapabilityType;
  version: string;
  installedAt: string;
}
