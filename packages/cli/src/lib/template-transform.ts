import { relative, dirname, join } from "pathe";

export function resolveSharedPath(fileDest: string, capabilityRoot: string): string {
  const sharedDir = join(capabilityRoot, "shared");
  return relative(dirname(fileDest), sharedDir);
}

export function applyTemplateMarkers(
  content: string,
  markers: Record<string, string>,
): string {
  return Object.entries(markers).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    content,
  );
}
