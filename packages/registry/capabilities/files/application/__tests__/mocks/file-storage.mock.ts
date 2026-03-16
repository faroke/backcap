import type { File } from "../../../domain/entities/file.entity.js";
import type { IFileStorage } from "../../ports/file-storage.port.js";

export class InMemoryFileStorage implements IFileStorage {
  private store = new Map<string, File>();

  async save(file: File): Promise<void> {
    this.store.set(file.id, file);
  }

  async findById(fileId: string): Promise<File | null> {
    return this.store.get(fileId) ?? null;
  }

  async delete(fileId: string): Promise<void> {
    this.store.delete(fileId);
  }
}
