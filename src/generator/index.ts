import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'yaml';
import type { CapabilitySpec, ProjectConfig } from '../types/index.js';

export async function generateCapability(
  capability: { name: string; description: string; spec: CapabilitySpec },
  targetDir: string,
  config: ProjectConfig
) {
  await fs.mkdir(targetDir, { recursive: true });

  await generateSpec(capability.spec, targetDir);
  await generateCore(capability.spec, targetDir);
  await generatePorts(capability.spec, targetDir);
  await generateUsecases(capability.spec, targetDir);
  await generateEvents(capability.spec, targetDir);
  await generateAdapters(capability.spec, targetDir, config);
  await generateTests(capability.spec, targetDir);
  await generateSkills(capability.spec, targetDir);
}

async function generateSpec(spec: CapabilitySpec, targetDir: string) {
  const specPath = path.join(targetDir, 'spec.yaml');
  await fs.writeFile(specPath, yaml.stringify(spec));
}

async function generateCore(spec: CapabilitySpec, targetDir: string) {
  const coreDir = path.join(targetDir, 'core');
  await fs.mkdir(coreDir, { recursive: true });

  if (spec.entities) {
    const entitiesPath = path.join(coreDir, 'entities.ts');
    let entitiesContent = '// Domain Entities\n\n';

    for (const [entityName, fields] of Object.entries(spec.entities)) {
      entitiesContent += `export interface ${entityName} {\n`;
      for (const [fieldName, fieldType] of Object.entries(fields)) {
        const tsType = mapType(fieldType);
        entitiesContent += `  ${fieldName}: ${tsType};\n`;
      }
      entitiesContent += '}\n\n';
    }

    await fs.writeFile(entitiesPath, entitiesContent);
  }
}

async function generatePorts(spec: CapabilitySpec, targetDir: string) {
  const portsDir = path.join(targetDir, 'ports');
  await fs.mkdir(portsDir, { recursive: true });

  if (spec.ports) {
    for (const port of spec.ports) {
      const portPath = path.join(portsDir, `${toKebabCase(port)}.ts`);
      const portContent = generatePortInterface(port, spec);
      await fs.writeFile(portPath, portContent);
    }
  }
}

async function generateUsecases(spec: CapabilitySpec, targetDir: string) {
  const usecasesDir = path.join(targetDir, 'usecases');
  await fs.mkdir(usecasesDir, { recursive: true });

  if (spec.usecases) {
    for (const usecase of spec.usecases) {
      const usecasePath = path.join(usecasesDir, `${toKebabCase(usecase)}.ts`);
      const usecaseContent = generateUsecaseClass(usecase, spec);
      await fs.writeFile(usecasePath, usecaseContent);
    }
  }
}

async function generateEvents(spec: CapabilitySpec, targetDir: string) {
  const eventsDir = path.join(targetDir, 'events');
  await fs.mkdir(eventsDir, { recursive: true });

  if (spec.events) {
    const eventsPath = path.join(eventsDir, 'index.ts');
    let eventsContent = '// Domain Events\n\n';

    eventsContent += 'export type EventType =\n';
    eventsContent += spec.events.map((e) => `  | '${e}'`).join('\n');
    eventsContent += ';\n\n';

    eventsContent += `export interface DomainEvent {\n`;
    eventsContent += `  type: EventType;\n`;
    eventsContent += `  timestamp: Date;\n`;
    eventsContent += `  data: unknown;\n`;
    eventsContent += `}\n`;

    await fs.writeFile(eventsPath, eventsContent);
  }
}

async function generateAdapters(
  spec: CapabilitySpec,
  targetDir: string,
  config: ProjectConfig
) {
  const adaptersDir = path.join(targetDir, 'adapters');
  await fs.mkdir(adaptersDir, { recursive: true });

  if (spec.ports) {
    for (const port of spec.ports) {
      if (port.includes('Repository')) {
        const adapterPath = path.join(
          adaptersDir,
          `${toKebabCase(port)}-${config.orm}.ts`
        );
        const adapterContent = generateRepositoryAdapter(port, spec, config.orm);
        await fs.writeFile(adapterPath, adapterContent);
      }
    }
  }
}

async function generateTests(spec: CapabilitySpec, targetDir: string) {
  const testsDir = path.join(targetDir, 'tests');
  await fs.mkdir(testsDir, { recursive: true });

  const testPath = path.join(testsDir, `${spec.capability}.test.ts`);
  const testContent = `import { describe, it, expect } from 'vitest';

describe('${spec.capability}', () => {
  it('should be implemented', () => {
    expect(true).toBe(true);
  });
});
`;
  await fs.writeFile(testPath, testContent);
}

async function generateSkills(spec: CapabilitySpec, targetDir: string) {
  const skillsDir = path.join(targetDir, 'skills');
  await fs.mkdir(skillsDir, { recursive: true });

  const skills = [
    {
      name: 'extend-capability',
      description: 'Add new features to this capability',
    },
    {
      name: 'add-usecase',
      description: 'Add a new use case',
    },
    {
      name: 'add-event',
      description: 'Add a new domain event',
    },
  ];

  for (const skill of skills) {
    const skillPath = path.join(skillsDir, `${skill.name}.md`);
    const skillContent = `# ${skill.name}

## Description
${skill.description}

## Context
Capability: ${spec.capability}
Version: ${spec.version}

## Available Information
- Entities: ${spec.entities ? Object.keys(spec.entities).join(', ') : 'none'}
- Use Cases: ${spec.usecases?.join(', ') || 'none'}
- Events: ${spec.events?.join(', ') || 'none'}
- Ports: ${spec.ports?.join(', ') || 'none'}

## Instructions
When using this skill, the AI should:
1. Read the capability spec.yaml
2. Understand the current architecture
3. Generate code that follows the existing patterns
4. Update the spec.yaml if adding new entities/events
5. Maintain clean architecture principles
`;
    await fs.writeFile(skillPath, skillContent);
  }
}

function generatePortInterface(port: string, spec: CapabilitySpec): string {
  const methods = generatePortMethods(port, spec);

  return `// Port: ${port}

export interface ${port} {
${methods.map((m) => `  ${m.name}(${m.params}): Promise<${m.returnType}>;`).join('\n')}
}
`;
}

function generatePortMethods(
  port: string,
  spec: CapabilitySpec
): Array<{ name: string; params: string; returnType: string }> {
  if (port.includes('Repository')) {
    const entityName = port.replace('Repository', '');
    return [
      { name: 'findById', params: 'id: string', returnType: `${entityName} | null` },
      { name: 'save', params: `entity: ${entityName}`, returnType: `${entityName}` },
      { name: 'delete', params: 'id: string', returnType: 'void' },
      { name: 'findAll', params: '', returnType: `${entityName}[]` },
    ];
  }

  return [{ name: 'execute', params: '', returnType: 'void' }];
}

function generateUsecaseClass(usecase: string, spec: CapabilitySpec): string {
  const className = toPascalCase(usecase);
  const ports = spec.ports?.join(', ') || '';

  return `// Use Case: ${usecase}

export class ${className} {
  constructor(
    // Inject ports here
  ) {}

  async execute(input: ${className}Input): Promise<${className}Output> {
    // Implement use case logic
    throw new Error('Not implemented');
  }
}

export interface ${className}Input {
  // Define input parameters
}

export interface ${className}Output {
  // Define output structure
}
`;
}

function generateRepositoryAdapter(
  port: string,
  spec: CapabilitySpec,
  orm: string
): string {
  const entityName = port.replace('Repository', '');

  if (orm === 'prisma') {
    return `// Prisma Adapter for ${port}
import { PrismaClient } from '@prisma/client';
import { ${port} } from '../ports/${toKebabCase(port)}.js';
import { ${entityName} } from '../core/entities.js';

export class Prisma${port} implements ${port} {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<${entityName} | null> {
    // Implement with Prisma
    throw new Error('Not implemented');
  }

  async save(entity: ${entityName}): Promise<${entityName}> {
    // Implement with Prisma
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // Implement with Prisma
    throw new Error('Not implemented');
  }

  async findAll(): Promise<${entityName}[]> {
    // Implement with Prisma
    throw new Error('Not implemented');
  }
}
`;
  }

  return `// ${orm} Adapter for ${port}
import { ${port} } from '../ports/${toKebabCase(port)}.js';
import { ${entityName} } from '../core/entities.js';

export class ${orm.charAt(0).toUpperCase() + orm.slice(1)}${port} implements ${port} {
  async findById(id: string): Promise<${entityName} | null> {
    throw new Error('Not implemented');
  }

  async save(entity: ${entityName}): Promise<${entityName}> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<${entityName}[]> {
    throw new Error('Not implemented');
  }
}
`;
}

function mapType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    'string[]': 'string[]',
    'number[]': 'number[]',
  };
  return typeMap[type] || 'unknown';
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
