import type { MediaAsset } from "../../domain/entities/media-asset.entity.js";

export interface FindAllOptions {
  limit?: number;
  offset?: number;
}

export interface IMediaRepository {
  save(asset: MediaAsset): Promise<void>;
  findById(mediaId: string): Promise<MediaAsset | null>;
  findAll(options?: FindAllOptions): Promise<MediaAsset[]>;
  delete(mediaId: string): Promise<void>;
}
