export interface CapabilityMeta {
  name: string;
  path: string;
}

export interface AdapterMeta {
  name: string;
  path: string;
  capability: string;
  category: string;
}

export interface BridgeMeta {
  name: string;
  path: string;
  dependencies: string[];
}

export interface SkillMeta {
  name: string;
  path: string;
}
