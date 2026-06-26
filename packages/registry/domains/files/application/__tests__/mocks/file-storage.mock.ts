import type { File } from "../../../domain/entities/file.entity.js";
import type { IFileStorage, FindAllOptions } from "../../ports/file-storage.port.js";

export class InMemoryFileStorage implements IFileStorage {
  private store = new Map<string, File>();
  private blobStore = new Map<string, Buffer>();

  async save(file: File): Promise<void> {
    this.store.set(file.id, file);
  }

  async findById(fileId: string): Promise<File | null> {
    return this.store.get(fileId) ?? null;
  }

  async findAll(options?: FindAllOptions): Promise<File[]> {
    const all = Array.from(this.store.values());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? all.length;
    return all.slice(offset, offset + limit);
  }

  async delete(fileId: string): Promise<void> {
    this.store.delete(fileId);
  }

  async upload(key: string, data: Buffer): Promise<void> {
    this.blobStore.set(key, data);
  }

  async download(key: string): Promise<Buffer> {
    const data = this.blobStore.get(key);
    if (!data) {
      throw new Error(`Key not found: ${key}`);
    }
    return data;
  }

  async getUrl(key: string): Promise<string> {
    return `https://cdn.example.com/${key}`;
  }
}
