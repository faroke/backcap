import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname, normalize } from "pathe";
import { applyTemplateMarkers, resolveSharedPath, resolveRelPath, processTemplateComments } from "./template-transform.js";

interface FileEntry {
  path: string;
  content: string;
}

interface WriteOptions {
  capabilityRoot: string;
  markers: Record<string, string>;
  cwd?: string;
}

function buildFileMarkers(destPath: string, capabilityRoot: string, markers: Record<string, string>, cwd?: string): Record<string, string> {
  const sharedPath = resolveSharedPath(destPath, capabilityRoot);
  const fileMarkers: Record<string, string> = { ...markers, shared_path: sharedPath };

  if (cwd) {
    if (markers.capabilities_path) {
      fileMarkers.cap_rel = resolveRelPath(destPath, cwd, markers.capabilities_path);
    }
    if (markers.bridges_path) {
      fileMarkers.bridges_rel = resolveRelPath(destPath, cwd, markers.bridges_path);
    }
    // shared_rel points to the project-level shared directory (config.paths.shared or fallback)
    const sharedConfigPath = markers.shared_config_path ?? "src/shared";
    fileMarkers.shared_rel = resolveRelPath(destPath, cwd, sharedConfigPath);
  }

  return fileMarkers;
}

export function resolveFileMarkers(
  files: FileEntry[],
  capabilityRoot: string,
  markers: Record<string, string>,
  cwd?: string,
): Array<{ relativePath: string; content: string }> {
  return files.map((f) => {
    const destPath = normalize(join(capabilityRoot, f.path));
    const fileMarkers = buildFileMarkers(destPath, capabilityRoot, markers, cwd);
    let content = applyTemplateMarkers(f.content, fileMarkers);
    content = processTemplateComments(content, fileMarkers);
    return {
      relativePath: f.path,
      content,
    };
  });
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

    const fileMarkers = buildFileMarkers(destPath, options.capabilityRoot, options.markers, options.cwd);
    let content = applyTemplateMarkers(file.content, fileMarkers);
    content = processTemplateComments(content, fileMarkers);

    await writeFile(destPath, content, "utf-8");
    writtenPaths.push(destPath);
  }

  return writtenPaths;
}
