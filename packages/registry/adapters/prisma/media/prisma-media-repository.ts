// Template: import type { IMediaRepository } from "{{capabilities_path}}/media/application/ports/media-repository.port";
import type { IMediaRepository, FindAllOptions } from "../../../capabilities/media/application/ports/media-repository.port.js";
import { MediaAsset } from "../../../capabilities/media/domain/entities/media-asset.entity.js";
import { MediaVariant } from "../../../capabilities/media/domain/entities/media-variant.entity.js";

interface PrismaMediaVariantRecord {
  id: string;
  mediaAssetId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  purpose: string;
}

interface PrismaMediaAssetRecord {
  id: string;
  originalUrl: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  uploadedAt: Date;
  variants?: PrismaMediaVariantRecord[];
}

interface PrismaMediaVariantDelegate {
  deleteMany(args: { where: { mediaAssetId: string } }): Promise<{ count: number }>;
  createMany(args: { data: PrismaMediaVariantRecord[] }): Promise<{ count: number }>;
}

interface PrismaMediaAssetDelegate {
  findUnique(args: {
    where: { id: string };
    include?: { variants?: boolean };
  }): Promise<PrismaMediaAssetRecord | null>;
  findMany(args?: { include?: { variants?: boolean }; skip?: number; take?: number }): Promise<PrismaMediaAssetRecord[]>;
  upsert(args: {
    where: { id: string };
    create: Omit<PrismaMediaAssetRecord, "variants">;
    update: Omit<PrismaMediaAssetRecord, "variants">;
  }): Promise<PrismaMediaAssetRecord>;
  delete(args: { where: { id: string } }): Promise<PrismaMediaAssetRecord>;
}

interface PrismaClient {
  mediaAssetRecord: PrismaMediaAssetDelegate;
  mediaVariantRecord: PrismaMediaVariantDelegate;
  $transaction(fn: (tx: PrismaClient) => Promise<void>): Promise<void>;
}

export class PrismaMediaRepository implements IMediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(asset: MediaAsset): Promise<void> {
    const data = this.toPrisma(asset);
    await this.prisma.$transaction(async (tx) => {
      await tx.mediaAssetRecord.upsert({
        where: { id: asset.id },
        create: data,
        update: data,
      });
      await tx.mediaVariantRecord.deleteMany({ where: { mediaAssetId: asset.id } });
      if (asset.variants.length > 0) {
        await tx.mediaVariantRecord.createMany({
          data: asset.variants.map((v) => ({
            id: v.id,
            mediaAssetId: asset.id,
            url: v.url,
            width: v.width,
            height: v.height,
            format: v.format,
            purpose: v.purpose.value,
          })),
        });
      }
    });
  }

  async findById(mediaId: string): Promise<MediaAsset | null> {
    const record = await this.prisma.mediaAssetRecord.findUnique({
      where: { id: mediaId },
      include: { variants: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(options?: FindAllOptions): Promise<MediaAsset[]> {
    const records = await this.prisma.mediaAssetRecord.findMany({
      include: { variants: true },
      skip: options?.offset,
      take: options?.limit,
    });
    return records.map((r) => this.toDomain(r));
  }

  async delete(mediaId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.mediaVariantRecord.deleteMany({ where: { mediaAssetId: mediaId } });
      await tx.mediaAssetRecord.delete({ where: { id: mediaId } });
    });
  }

  private toDomain(record: PrismaMediaAssetRecord): MediaAsset {
    const variants = (record.variants ?? []).map((v) => {
      const result = MediaVariant.create({
        id: v.id,
        url: v.url,
        width: v.width,
        height: v.height,
        format: v.format,
        purpose: v.purpose,
      });
      return result.unwrap();
    });

    const params: {
      id: string;
      originalUrl: string;
      mimeType: string;
      size: number;
      width?: number;
      height?: number;
      variants: typeof variants;
      uploadedAt: Date;
    } = {
      id: record.id,
      originalUrl: record.originalUrl,
      mimeType: record.mimeType,
      size: record.size,
      variants,
      uploadedAt: record.uploadedAt,
    };

    if (record.width !== null && record.height !== null) {
      params.width = record.width;
      params.height = record.height;
    }

    const result = MediaAsset.create(params);
    // Data from DB is trusted; unwrap safely
    return result.unwrap();
  }

  private toPrisma(asset: MediaAsset): Omit<PrismaMediaAssetRecord, "variants"> {
    return {
      id: asset.id,
      originalUrl: asset.originalUrl,
      mimeType: asset.mimeType.value,
      width: asset.dimensions?.width ?? null,
      height: asset.dimensions?.height ?? null,
      size: asset.size,
      uploadedAt: asset.uploadedAt,
    };
  }
}
