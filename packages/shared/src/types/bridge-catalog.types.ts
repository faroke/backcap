export interface BridgeCatalogEntry {
  name: string;
  sourceDomain: string;
  targetDomain: string;
  events: string[];
  version: string;
}

export interface BridgeCatalog {
  bridges: BridgeCatalogEntry[];
}
