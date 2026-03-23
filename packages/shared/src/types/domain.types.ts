export type DomainType = "domain" | "adapter" | "bridge" | "skill";

export interface TemplateMarker {
  key: string;
  configPath: string;
}

export interface InstalledDomain {
  name: string;
  type: DomainType;
  version: string;
  installedAt: string;
}
