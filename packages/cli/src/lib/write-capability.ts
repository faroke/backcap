import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname, normalize } from "pathe";

interface FileEntry {
  path: string;
  content: string;
}

interface WriteOptions {
  capabilityRoot: string;
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

    await writeFile(destPath, file.content, "utf-8");
    writtenPaths.push(destPath);
  }

  return writtenPaths;
}
