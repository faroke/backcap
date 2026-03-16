import * as clack from "@clack/prompts";
import type { ConflictReport, FileConflict } from "./conflict-detector.js";

const MAX_DIFF_LINES = 50;

function groupByStatus(files: FileConflict[]): {
  newFiles: FileConflict[];
  modifiedFiles: FileConflict[];
  identicalFiles: FileConflict[];
} {
  const newFiles: FileConflict[] = [];
  const modifiedFiles: FileConflict[] = [];
  const identicalFiles: FileConflict[] = [];

  for (const file of files) {
    if (file.status === "new") newFiles.push(file);
    else if (file.status === "modified") modifiedFiles.push(file);
    else identicalFiles.push(file);
  }

  return { newFiles, modifiedFiles, identicalFiles };
}

function computeLineDiff(existing: string, incoming: string): string[] {
  const existingLines = existing.split("\n");
  const incomingLines = incoming.split("\n");
  const lines: string[] = [];

  const maxLen = Math.max(existingLines.length, incomingLines.length);
  for (let i = 0; i < maxLen; i++) {
    const existLine = i < existingLines.length ? existingLines[i] : undefined;
    const incomLine = i < incomingLines.length ? incomingLines[i] : undefined;

    if (existLine === incomLine) continue;

    if (existLine !== undefined && incomLine !== undefined) {
      lines.push(`- ${existLine}`);
      lines.push(`+ ${incomLine}`);
    } else if (existLine !== undefined) {
      lines.push(`- ${existLine}`);
    } else if (incomLine !== undefined) {
      lines.push(`+ ${incomLine}`);
    }
  }

  return lines;
}

export function renderConflictSummary(report: ConflictReport): void {
  const { newFiles, modifiedFiles, identicalFiles } = groupByStatus(report.files);

  const sections: string[] = [];

  if (newFiles.length > 0) {
    sections.push(
      `New files (${newFiles.length}):\n${newFiles.map((f) => `  + ${f.relativePath}`).join("\n")}`,
    );
  }

  if (modifiedFiles.length > 0) {
    sections.push(
      `Modified files (${modifiedFiles.length}):\n${modifiedFiles.map((f) => `  ~ ${f.relativePath}`).join("\n")}`,
    );
  }

  if (identicalFiles.length > 0) {
    sections.push(
      `Identical files (${identicalFiles.length}):\n${identicalFiles.map((f) => `  = ${f.relativePath}`).join("\n")}`,
    );
  }

  clack.note(sections.join("\n\n"), "Conflict Report");
}

export function renderDetailedDiffs(report: ConflictReport): void {
  const modifiedFiles = report.files.filter((f) => f.status === "modified");

  for (const file of modifiedFiles) {
    if (!file.existingContent) continue;

    const diffLines = computeLineDiff(file.existingContent, file.incomingContent);
    const truncated = diffLines.length > MAX_DIFF_LINES;
    const displayed = truncated ? diffLines.slice(0, MAX_DIFF_LINES) : diffLines;

    let body = displayed.join("\n");
    if (truncated) {
      body += `\n...${diffLines.length - MAX_DIFF_LINES} more lines`;
    }

    clack.note(body, file.relativePath);
  }
}
