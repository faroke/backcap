export interface BridgeCatalogEntry {
  name: string;
  sourceCapability: string;
  targetCapability: string;
  events: string[];
  version: string;
}

export interface BridgeCatalog {
  bridges: BridgeCatalogEntry[];
}
