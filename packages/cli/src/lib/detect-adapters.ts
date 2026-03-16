import { readPackageJSON } from "pkg-types";

interface AdapterMapping {
  npmPackage: string;
  adapterName: string;
}

const ADAPTER_MAPPINGS: AdapterMapping[] = [
  { npmPackage: "@prisma/client", adapterName: "auth-prisma" },
  { npmPackage: "express", adapterName: "auth-express" },
];

export async function detectAdapters(
  cwd: string,
  availableAdapters: string[],
): Promise<string[]> {
  try {
    const pkg = await readPackageJSON(cwd);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    return ADAPTER_MAPPINGS
      .filter(
        (m) => m.npmPackage in deps && availableAdapters.includes(m.adapterName),
      )
      .map((m) => m.adapterName);
  } catch {
    return [];
  }
}
