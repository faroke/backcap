import { readdir } from "node:fs/promises";

export async function detectInstalledDomains(domainsPath: string): Promise<string[]> {
  try {
    const entries = await readdir(domainsPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}
