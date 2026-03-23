import { describe, it, expect } from "vitest";
import { MediaAsset } from "../entities/media-asset.entity.js";
import { MediaVariant } from "../entities/media-variant.entity.js";
import { UnsupportedFormat } from "../errors/unsupported-format.error.js";
import { FileTooLarge } from "../errors/file-too-large.error.js";

describe("MediaAsset entity", () => {
  const validParams = {
    id: "media-1",
    originalUrl: "uploads/photo.jpg",
    mimeType: "image/jpeg",
    width: 1920,
    height: 1080,
    size: 2048,
  };

  it("creates a valid media asset with dimensions", () => {
    const result = MediaAsset.create(validParams);
    expect(result.isOk()).toBe(true);
    const asset = result.unwrap();
    expect(asset.id).toBe("media-1");
    expect(asset.originalUrl).toBe("uploads/photo.jpg");
    expect(asset.mimeType.value).toBe("image/jpeg");
    expect(asset.mimeType.isImage()).toBe(true);
    expect(asset.dimensions?.width).toBe(1920);
    expect(asset.dimensions?.height).toBe(1080);
    expect(asset.size).toBe(2048);
    expect(asset.variants).toHaveLength(0);
    expect(asset.uploadedAt).toBeInstanceOf(Date);
  });

  it("creates a valid media asset without dimensions", () => {
    const result = MediaAsset.create({
      id: "media-2",
      originalUrl: "uploads/doc.pdf",
      mimeType: "application/pdf",
      size: 4096,
    });
    expect(result.isOk()).toBe(true);
    const asset = result.unwrap();
    expect(asset.dimensions).toBeNull();
  });

  it("creates a media asset with custom uploadedAt", () => {
    const uploadedAt = new Date("2024-01-01T00:00:00.000Z");
    const result = MediaAsset.create({ ...validParams, uploadedAt });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().uploadedAt).toBe(uploadedAt);
  });

  it("fails with unsupported MIME type", () => {
    const result = MediaAsset.create({ ...validParams, mimeType: "application/x-unknown" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UnsupportedFormat);
  });

  it("fails with zero size", () => {
    const result = MediaAsset.create({ ...validParams, size: 0 });
    expect(result.isFail()).toBe(true);
  });

  it("fails with negative size", () => {
    const result = MediaAsset.create({ ...validParams, size: -1 });
    expect(result.isFail()).toBe(true);
  });

  it("fails with non-integer size", () => {
    const result = MediaAsset.create({ ...validParams, size: 1.5 });
    expect(result.isFail()).toBe(true);
  });

  it("fails when size exceeds maxSize", () => {
    const result = MediaAsset.create({ ...validParams, size: 5000, maxSize: 4096 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FileTooLarge);
  });

  it("passes when size is within maxSize", () => {
    const result = MediaAsset.create({ ...validParams, size: 2048, maxSize: 4096 });
    expect(result.isOk()).toBe(true);
  });

  it("fails with empty originalUrl", () => {
    const result = MediaAsset.create({ ...validParams, originalUrl: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid dimensions", () => {
    const result = MediaAsset.create({ ...validParams, width: -1, height: 100 });
    expect(result.isFail()).toBe(true);
  });

  it("fails when only width is provided without height", () => {
    const result = MediaAsset.create({ ...validParams, width: 800, height: undefined });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Both width and height");
  });

  it("fails when only height is provided without width", () => {
    const result = MediaAsset.create({ ...validParams, width: undefined, height: 600 });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("Both width and height");
  });

  it("adds a variant immutably", () => {
    const asset = MediaAsset.create(validParams).unwrap();
    const variant = MediaVariant.create({
      id: "var-1",
      url: "uploads/photo-thumb.jpg",
      width: 150,
      height: 150,
      format: "jpeg",
      purpose: "thumbnail",
    }).unwrap();

    const updated = asset.addVariant(variant);
    expect(updated.variants).toHaveLength(1);
    expect(updated.variants[0].id).toBe("var-1");
    // Original unchanged
    expect(asset.variants).toHaveLength(0);
  });

  it("replaces variants with withVariants", () => {
    const asset = MediaAsset.create(validParams).unwrap();
    const v1 = MediaVariant.create({
      id: "var-1",
      url: "uploads/thumb.jpg",
      width: 150,
      height: 150,
      format: "jpeg",
      purpose: "thumbnail",
    }).unwrap();
    const v2 = MediaVariant.create({
      id: "var-2",
      url: "uploads/preview.jpg",
      width: 800,
      height: 600,
      format: "jpeg",
      purpose: "preview",
    }).unwrap();

    const updated = asset.withVariants([v1, v2]);
    expect(updated.variants).toHaveLength(2);
  });
});
