import { relative, dirname, join } from "pathe";

export function resolveSharedPath(fileDest: string, capabilityRoot: string): string {
  const sharedDir = join(capabilityRoot, "shared");
  return relative(dirname(fileDest), sharedDir);
}

export function resolveRelPath(fileDest: string, cwd: string, configPath: string): string {
  const targetDir = join(cwd, configPath);
  return relative(dirname(fileDest), targetDir);
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

/**
 * Process `// Template:` comment lines.
 * When a line matches `// Template: <import statement>`, resolve markers
 * in the template and replace the NEXT line (the registry-relative import)
 * with the resolved template. The `// Template:` comment is removed.
 */
export function processTemplateComments(
  content: string,
  markers: Record<string, string>,
): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith("// Template:") && i + 1 < lines.length) {
      const templateContent = trimmed.slice("// Template:".length).trim();
      const resolved = applyTemplateMarkers(templateContent, markers);
      // Skip the Template comment, replace the next line with resolved version
      i++; // skip comment
      // Preserve leading whitespace from the original import line
      const leadingWhitespace = lines[i].match(/^(\s*)/)?.[1] ?? "";
      result.push(leadingWhitespace + resolved);
    } else {
      result.push(lines[i]);
    }
    i++;
  }

  return result.join("\n");
}
