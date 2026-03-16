import * as clack from "@clack/prompts";
import type { ConflictReport } from "./conflict-detector.js";

export interface InstallResult {
  installed: string[];
  skipped: string[];
  alwaysInstalled: string[];
}

export class InstallCancelledError extends Error {
  constructor() {
    super("Installation cancelled by user.");
    this.name = "InstallCancelledError";
  }
}

export async function selectiveInstall(
  report: ConflictReport,
  skillFiles: Set<string>,
): Promise<InstallResult> {
  const options = report.files.map((file) => {
    const isSkill = skillFiles.has(file.relativePath);
    const statusLabel =
      file.status === "new" ? "new" : file.status === "modified" ? "modified" : "identical";

    return {
      value: file.relativePath,
      label: `${file.relativePath} (${statusLabel})`,
      hint: isSkill ? "always installed" : undefined,
    };
  });

  // Pre-check: new and identical files are checked, modified are unchecked
  const initialValues = report.files
    .filter((f) => f.status !== "modified")
    .map((f) => f.relativePath);

  // Always include skill files in initial values
  for (const skillPath of skillFiles) {
    if (!initialValues.includes(skillPath)) {
      initialValues.push(skillPath);
    }
  }

  const selected = await clack.multiselect({
    message: "Select files to install:",
    options,
    initialValues,
  });

  if (clack.isCancel(selected)) {
    throw new InstallCancelledError();
  }

  const selectedSet = new Set(selected as string[]);

  // Ensure skill files are always included
  for (const skillPath of skillFiles) {
    selectedSet.add(skillPath);
  }

  const installed: string[] = [];
  const skipped: string[] = [];
  const alwaysInstalled: string[] = [];

  for (const file of report.files) {
    if (skillFiles.has(file.relativePath)) {
      alwaysInstalled.push(file.relativePath);
    } else if (selectedSet.has(file.relativePath)) {
      installed.push(file.relativePath);
    } else {
      skipped.push(file.relativePath);
    }
  }

  return { installed, skipped, alwaysInstalled };
}
