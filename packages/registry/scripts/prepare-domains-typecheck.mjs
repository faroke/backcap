// Materializes the shared/result.ts file that the registry build injects into
// every scaffolded domain, so that `tsc` can resolve the `shared/result.js`
// imports exactly as a consumer's project would. These files live under
// domains/<name>/shared/ and are gitignored — they are a build artifact, the
// single source of truth is packages/shared/src/result.ts.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const registryRoot = join(here, "..");
const domainsDir = join(registryRoot, "domains");
const resultTs = await readFile(
  join(registryRoot, "../shared/src/result.ts"),
  "utf-8",
);

const entries = await readdir(domainsDir, { withFileTypes: true });
let count = 0;
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const sharedDir = join(domainsDir, entry.name, "shared");
  await mkdir(sharedDir, { recursive: true });
  await writeFile(join(sharedDir, "result.ts"), resultTs);
  count++;
}
console.log(`[typecheck] Materialized shared/result.ts into ${count} domains`);
