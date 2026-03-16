import { readFile } from "node:fs/promises";
import { join, relative, resolve } from "pathe";
import { ConflictDetectionError } from "../errors/conflict-detection.error.js";

export type FileStatus = "new" | "modified" | "identical";

export interface IncomingFile {
  relativePath: string;
  content: string;
}

export interface FileConflict {
  relativePath: string;
  status: FileStatus;
  existingContent?: string;
  incomingContent: string;
}

export interface ConflictReport {
  hasConflicts: boolean;
  files: FileConflict[];
}

export async function detectConflicts(
  targetDir: string,
  incomingFiles: IncomingFile[],
): Promise<ConflictReport> {
  const resolvedTarget = resolve(targetDir);
  const files: FileConflict[] = [];

  for (const incoming of incomingFiles) {
    const filePath = resolve(join(resolvedTarget, incoming.relativePath));

    // Guard against path traversal
    const rel = relative(resolvedTarget, filePath);
    if (rel.startsWith("..") || rel.startsWith("/")) {
      throw new ConflictDetectionError(
        `Path traversal detected: "${incoming.relativePath}" resolves outside target directory`,
        incoming.relativePath,
        "Ensure all file paths in the capability are relative and do not contain '..' segments.",
      );
    }

    try {
      const existingContent = await readFile(filePath, "utf-8");

      if (existingContent === incoming.content) {
        files.push({
          relativePath: incoming.relativePath,
          status: "identical",
          existingContent,
          incomingContent: incoming.content,
        });
      } else {
        files.push({
          relativePath: incoming.relativePath,
          status: "modified",
          existingContent,
          incomingContent: incoming.content,
        });
      }
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;

      if (error.code === "ENOENT") {
        files.push({
          relativePath: incoming.relativePath,
          status: "new",
          incomingContent: incoming.content,
        });
      } else if (error.code === "EACCES") {
        throw new ConflictDetectionError(
          `Permission denied reading "${incoming.relativePath}"`,
          incoming.relativePath,
          "Check file permissions or run the command with appropriate privileges.",
          error,
        );
      } else {
        throw new ConflictDetectionError(
          `Failed to read "${incoming.relativePath}": ${error.message}`,
          incoming.relativePath,
          "Check that the file is accessible and the disk is not full.",
          error,
        );
      }
    }
  }

  const hasConflicts = files.some((f) => f.status === "modified");

  return { hasConflicts, files };
}
