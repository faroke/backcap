import { MediaAsset } from "../../../domain/entities/media-asset.entity.js";

export function createTestMediaAsset(
  overrides?: Partial<{
    id: string;
    originalUrl: string;
    mimeType: string;
    width: number;
    height: number;
    size: number;
  }>,
): MediaAsset {
  const result = MediaAsset.create({
    id: overrides?.id ?? "test-media-1",
    originalUrl: overrides?.originalUrl ?? "uploads/photo.jpg",
    mimeType: overrides?.mimeType ?? "image/jpeg",
    width: overrides?.width ?? 1920,
    height: overrides?.height ?? 1080,
    size: overrides?.size ?? 2048,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test media asset: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
