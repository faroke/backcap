// Template: import type { ITagRepository, TagResourceFilters } from "{{cap_rel}}/tags/application/ports/tag-repository.port.js";
import type { ITagRepository, TagResourceFilters } from "../../../capabilities/tags/application/ports/tag-repository.port.js";
// Template: import { Tag } from "{{cap_rel}}/tags/domain/entities/tag.entity.js";
import { Tag } from "../../../capabilities/tags/domain/entities/tag.entity.js";

interface PrismaTagRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface PrismaResourceTag {
  tagId: string;
  resourceId: string;
  resourceType: string;
  taggedAt: Date;
}

interface PrismaTagDelegate {
  findUnique(args: { where: { id?: string; slug?: string } }): Promise<PrismaTagRecord | null>;
  create(args: { data: PrismaTagRecord }): Promise<PrismaTagRecord>;
  upsert(args: {
    where: { id: string };
    create: PrismaTagRecord;
    update: Partial<PrismaTagRecord>;
  }): Promise<PrismaTagRecord>;
}

interface PrismaResourceTagDelegate {
  create(args: { data: PrismaResourceTag }): Promise<PrismaResourceTag>;
  delete(args: {
    where: { tagId_resourceId_resourceType: { tagId: string; resourceId: string; resourceType: string } };
  }): Promise<PrismaResourceTag>;
  findFirst(args: {
    where: { tagId: string; resourceId: string; resourceType: string };
  }): Promise<PrismaResourceTag | null>;
  findMany(args: {
    where: Record<string, unknown>;
    skip?: number;
    take?: number;
  }): Promise<PrismaResourceTag[]>;
  count(args: { where: Record<string, unknown> }): Promise<number>;
}

interface PrismaClient {
  tagRecord: PrismaTagDelegate;
  resourceTag: PrismaResourceTagDelegate;
}

export class PrismaTagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveTag(tag: Tag): Promise<void> {
    const data: PrismaTagRecord = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug.value,
      createdAt: tag.createdAt,
    };
    await this.prisma.tagRecord.upsert({
      where: { id: tag.id },
      create: data,
      update: data,
    });
  }

  async findBySlug(slug: string): Promise<Tag | undefined> {
    const record = await this.prisma.tagRecord.findUnique({ where: { slug } });
    if (!record) return undefined;
    const result = Tag.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      createdAt: record.createdAt,
    });
    if (result.isFail()) {
      throw new Error(`Corrupted tag record ${record.id}: ${result.unwrapError().message}`);
    }
    return result.unwrap();
  }

  async tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void> {
    await this.prisma.resourceTag.create({
      data: { tagId, resourceId, resourceType, taggedAt: new Date() },
    });
  }

  async untagResource(tagId: string, resourceId: string, resourceType: string): Promise<void> {
    await this.prisma.resourceTag.delete({
      where: { tagId_resourceId_resourceType: { tagId, resourceId, resourceType } },
    });
  }

  async isResourceTagged(tagId: string, resourceId: string, resourceType: string): Promise<boolean> {
    const entry = await this.prisma.resourceTag.findFirst({
      where: { tagId, resourceId, resourceType },
    });
    return entry !== null;
  }

  async findResourcesByTag(
    tagId: string,
    filters: TagResourceFilters,
  ): Promise<{
    resources: Array<{ resourceId: string; resourceType: string; taggedAt: Date }>;
    total: number;
  }> {
    const where: Record<string, unknown> = { tagId };
    if (filters.resourceType) where.resourceType = filters.resourceType;

    const [records, total] = await Promise.all([
      this.prisma.resourceTag.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.resourceTag.count({ where }),
    ]);

    return {
      resources: records.map((r) => ({
        resourceId: r.resourceId,
        resourceType: r.resourceType,
        taggedAt: r.taggedAt,
      })),
      total,
    };
  }
}
