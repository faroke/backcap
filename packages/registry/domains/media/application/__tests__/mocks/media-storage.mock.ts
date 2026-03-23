import type { IMediaStorage } from "../../ports/media-storage.port.js";

export class InMemoryMediaStorage implements IMediaStorage {
  private store = new Map<string, Buffer>();

  async upload(key: string, data: Buffer): Promise<void> {
    this.store.set(key, data);
  }

  async download(key: string): Promise<Buffer> {
    const data = this.store.get(key);
    if (!data) {
      throw new Error(`Key not found: ${key}`);
    }
    return data;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getUrl(key: string): Promise<string> {
    return `https://cdn.example.com/${key}`;
  }
}
