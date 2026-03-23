export interface DomainMeta {
  name: string;
  path: string;
}

export interface AdapterMeta {
  name: string;
  path: string;
  domain: string;
  category: string;
}

export interface BridgeMeta {
  name: string;
  path: string;
  dependencies: string[];
  sourceDomain?: string;
  targetDomain?: string;
  events?: string[];
}

export interface SkillMeta {
  name: string;
  path: string;
}
