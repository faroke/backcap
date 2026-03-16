import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "pathe";

export interface FileToWrite {
  relativePath: string;
  content: string;
}

export class FileWriteError extends Error {
  readonly filePath: string;
  readonly suggestion: string;
  override readonly cause?: unknown;

  constructor(message: string, filePath: string, suggestion: string, cause?: unknown) {
    super(message);
    this.name = "FileWriteError";
    this.filePath = filePath;
    this.suggestion = suggestion;
    this.cause = cause;
  }
}

export async function writeFiles(
  files: FileToWrite[],
  targetDir: string,
): Promise<void> {
  for (const file of files) {
    const destPath = join(targetDir, file.relativePath);
    const dir = dirname(destPath);

    try {
      await mkdir(dir, { recursive: true });
      await writeFile(destPath, file.content, "utf-8");
    } catch (err) {
      throw new FileWriteError(
        `Failed to write "${file.relativePath}": ${(err as Error).message}`,
        file.relativePath,
        "Check that the target directory is writable and disk space is available.",
        err,
      );
    }
  }
}
