import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname, normalize } from "pathe";
import { applyTemplateMarkers, resolveSharedPath } from "./template-transform.js";

interface FileEntry {
  path: string;
  content: string;
}

interface WriteOptions {
  capabilityRoot: string;
  markers: Record<string, string>;
}

export async function writeCapabilityFiles(
  files: FileEntry[],
  options: WriteOptions,
): Promise<string[]> {
  const writtenPaths: string[] = [];

  for (const file of files) {
    const destPath = normalize(join(options.capabilityRoot, file.path));
    const dir = dirname(destPath);
    await mkdir(dir, { recursive: true });

    // Compute per-file shared_path
    const sharedPath = resolveSharedPath(destPath, options.capabilityRoot);
    const fileMarkers = { ...options.markers, shared_path: sharedPath };

    const content = applyTemplateMarkers(file.content, fileMarkers);
    await writeFile(destPath, content, "utf-8");
    writtenPaths.push(destPath);
  }

  return writtenPaths;
}
