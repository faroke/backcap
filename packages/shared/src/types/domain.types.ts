export type DomainType = "domain" | "skill";

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
