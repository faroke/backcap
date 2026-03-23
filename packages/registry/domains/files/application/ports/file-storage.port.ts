import type { File } from "../../domain/entities/file.entity.js";

export interface IFileStorage {
  save(file: File): Promise<void>;
  findById(fileId: string): Promise<File | null>;
  delete(fileId: string): Promise<void>;
}
