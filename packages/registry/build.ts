import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "pathe";
import { registrySchema } from "@backcap/shared/schemas/registry";
import { registryItemSchema } from "@backcap/shared/schemas/registry-item";
import { runQualityChecks } from "./src/quality-check.js";
import {
  discoverCapabilities,
  discoverAdapters,
  discoverBridges,
  discoverSkills,
  generateCapabilityItemJson,
  generateAdapterItemJson,
  generateBridgeItemJson,
  generateSkillItemJson,
  generateRegistryCatalog,
} from "./src/generate.js";

async function main(): Promise<void> {
  const registryRoot = import.meta.dirname ?? ".";

  console.log("[build] Discovering capabilities...");
  const capabilities = await discoverCapabilities(registryRoot);
  console.log(`[build] Found ${capabilities.length} capabilities: ${capabilities.map((c) => c.name).join(", ")}`);

  console.log("[build] Running quality checks...");
  const qualityErrors = await runQualityChecks(capabilities);
  if (qualityErrors.length > 0) {
    for (const e of qualityErrors) {
      console.error(`[quality-check] ${e}`);
    }
    process.exit(1);
  }
  console.log("[build] Quality checks passed");

  // Read shared result.ts for injection
  const resultTs = await readFile(
    join(registryRoot, "../../packages/shared/src/result.ts"),
    "utf-8",
  );

  // Generate capability item JSONs
  const capItems = await Promise.all(
    capabilities.map((cap) => generateCapabilityItemJson(cap, resultTs)),
  );

  // Discover and generate adapter item JSONs
  const adapters = await discoverAdapters(registryRoot);
  const adapterItems = await Promise.all(
    adapters.map((adapter) => generateAdapterItemJson(adapter)),
  );

  // Discover and generate bridge item JSONs
  console.log("[build] Discovering bridges...");
  const bridges = await discoverBridges(registryRoot);
  console.log(`[build] Found ${bridges.length} bridges: ${bridges.map((b) => b.name).join(", ")}`);
  const bridgeItems = await Promise.all(
    bridges.map((bridge) => generateBridgeItemJson(bridge, resultTs)),
  );

  // Discover and generate skill item JSONs
  console.log("[build] Discovering skills...");
  const skills = await discoverSkills(registryRoot);
  console.log(`[build] Found ${skills.length} skills: ${skills.map((s) => s.name).join(", ")}`);
  const skillItems = await Promise.all(
    skills.map((skill) => generateSkillItemJson(skill)),
  );

  // Validate each item
  for (const item of [...capItems, ...adapterItems, ...bridgeItems, ...skillItems]) {
    const result = registryItemSchema.safeParse(item);
    if (!result.success) {
      console.error(`[build] Item validation failed for "${item.name}":`, result.error.issues);
      process.exit(1);
    }
  }

  // Generate catalog
  const catalog = await generateRegistryCatalog(capItems, adapterItems, bridgeItems, skillItems);
  const catalogResult = registrySchema.safeParse(catalog);
  if (!catalogResult.success) {
    console.error("[build] Registry catalog validation failed:", catalogResult.error.issues);
    process.exit(1);
  }

  // Write output
  const distDir = join(registryRoot, "dist");
  await mkdir(distDir, { recursive: true });

  await writeFile(join(distDir, "registry.json"), JSON.stringify(catalog, null, 2) + "\n");
  console.log("[build] Written dist/registry.json");

  for (const item of capItems) {
    await writeFile(join(distDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
    console.log(`[build] Written dist/${item.name}.json`);
  }

  for (const item of adapterItems) {
    await writeFile(join(distDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
    console.log(`[build] Written dist/${item.name}.json`);
  }

  // Write bridge JSONs
  const bridgesDistDir = join(distDir, "bridges");
  await mkdir(bridgesDistDir, { recursive: true });
  for (const item of bridgeItems) {
    await writeFile(join(bridgesDistDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
    console.log(`[build] Written dist/bridges/${item.name}.json`);
  }

  // Write skill JSONs
  const skillsDistDir = join(distDir, "skills");
  await mkdir(skillsDistDir, { recursive: true });
  for (const item of skillItems) {
    await writeFile(join(skillsDistDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
    console.log(`[build] Written dist/skills/${item.name}.json`);
  }

  // Write bridge catalog
  const bridgeCatalog = {
    bridges: bridgeItems.map((b) => ({
      name: b.name,
      version: "0.1.0",
      description: b.description,
      dependencies: b.dependencies,
    })),
  };
  await writeFile(join(bridgesDistDir, "index.json"), JSON.stringify(bridgeCatalog, null, 2) + "\n");
  console.log("[build] Written dist/bridges/index.json");

  console.log("[build] Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
