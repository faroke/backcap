import { readPackageJSON } from "pkg-types";

interface AdapterMapping {
  npmPackage: string;
  adapterSuffix: string;
  category: string;
}

const KNOWN_ADAPTERS: AdapterMapping[] = [
  { npmPackage: "@prisma/client", adapterSuffix: "prisma", category: "persistence" },
  { npmPackage: "express", adapterSuffix: "express", category: "http" },
  { npmPackage: "fastify", adapterSuffix: "fastify", category: "http" },
  { npmPackage: "@nestjs/core", adapterSuffix: "nestjs", category: "http" },
  { npmPackage: "hono", adapterSuffix: "hono", category: "http" },
  { npmPackage: "next", adapterSuffix: "nextjs", category: "http" },
  { npmPackage: "stripe", adapterSuffix: "stripe", category: "external" },
];

export interface DetectedAdapter {
  name: string;
  category: string;
  detected: boolean;
}

export async function detectAdapters(
  cwd: string,
  capabilityName: string,
): Promise<DetectedAdapter[]> {
  try {
    const pkg = await readPackageJSON(cwd);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    return KNOWN_ADAPTERS
      .map((mapping) => ({
        name: `${capabilityName}-${mapping.adapterSuffix}`,
        category: mapping.category,
        detected: mapping.npmPackage in deps,
      }))
      .filter((a) => a.detected);
  } catch {
    return [];
  }
}
