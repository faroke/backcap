import type { MediaAsset } from "../../../domain/entities/media-asset.entity.js";
import type { IMediaRepository, FindAllOptions } from "../../ports/media-repository.port.js";

export class InMemoryMediaRepository implements IMediaRepository {
  private store = new Map<string, MediaAsset>();

  async save(asset: MediaAsset): Promise<void> {
    this.store.set(asset.id, asset);
  }

  async findById(mediaId: string): Promise<MediaAsset | null> {
    return this.store.get(mediaId) ?? null;
  }

  async findAll(options?: FindAllOptions): Promise<MediaAsset[]> {
    const all = Array.from(this.store.values());
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? all.length;
    return all.slice(offset, offset + limit);
  }

  async delete(mediaId: string): Promise<void> {
    this.store.delete(mediaId);
  }
}
