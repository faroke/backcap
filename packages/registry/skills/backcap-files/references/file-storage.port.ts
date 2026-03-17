// Reference copy of capabilities/files/application/ports/file-storage.port.ts
// For skill documentation purposes — source of truth is the capability itself.

import type { File } from "../../domain/entities/file.entity.js";

export interface IFileStorage {
  save(file: File): Promise<void>;
  findById(fileId: string): Promise<File | null>;
  delete(fileId: string): Promise<void>;
}
