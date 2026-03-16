export interface CapabilitySpec {
  capability: string;
  version: string;
  description: string;
  category: CapabilityCategory;
  entities?: Record<string, Entity>;
  usecases?: string[];
  events?: string[];
  ports?: string[];
  dependencies?: string[];
}

export type CapabilityCategory =
  | 'identity'
  | 'data'
  | 'commerce'
  | 'communication'
  | 'infrastructure';

export interface Entity {
  [field: string]: string;
}

export interface ProjectConfig {
  name: string;
  runtime: 'node' | 'bun' | 'deno';
  framework: 'none' | 'nextjs' | 'express' | 'fastify' | 'nestjs';
  orm: 'prisma' | 'drizzle' | 'none';
  capabilities: string[];
}

export interface CapabilityTemplate {
  name: string;
  category: CapabilityCategory;
  files: FileTemplate[];
}

export interface FileTemplate {
  path: string;
  content: string;
}
