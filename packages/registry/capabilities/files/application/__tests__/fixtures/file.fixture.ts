import { File } from "../../../domain/entities/file.entity.js";

export function createTestFile(
  overrides?: Partial<{
    id: string;
    name: string;
    path: string;
    mimeType: string;
    size: number;
  }>,
): File {
  const result = File.create({
    id: overrides?.id ?? "test-file-1",
    name: overrides?.name ?? "document.pdf",
    path: overrides?.path ?? "uploads/document.pdf",
    mimeType: overrides?.mimeType ?? "application/pdf",
    size: overrides?.size ?? 1024,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test file: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
