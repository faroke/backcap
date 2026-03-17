import type { Tag } from "../../../../domain/entities/tag.entity.js";
import type { ITagRepository, TagResourceFilters } from "../../../ports/tag-repository.port.js";

interface ResourceTagEntry {
  tagId: string;
  resourceId: string;
  resourceType: string;
  taggedAt: Date;
}

export class InMemoryTagRepository implements ITagRepository {
  private tags = new Map<string, Tag>();
  private resourceTags: ResourceTagEntry[] = [];

  async saveTag(tag: Tag): Promise<void> {
    this.tags.set(tag.id, tag);
  }

  async findBySlug(slug: string): Promise<Tag | undefined> {
    return [...this.tags.values()].find((t) => t.slug.value === slug);
  }

  async tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void> {
    this.resourceTags.push({ tagId, resourceId, resourceType, taggedAt: new Date() });
  }

  async untagResource(tagId: string, resourceId: string, resourceType: string): Promise<void> {
    this.resourceTags = this.resourceTags.filter(
      (rt) => !(rt.tagId === tagId && rt.resourceId === resourceId && rt.resourceType === resourceType),
    );
  }

  async isResourceTagged(tagId: string, resourceId: string, resourceType: string): Promise<boolean> {
    return this.resourceTags.some(
      (rt) => rt.tagId === tagId && rt.resourceId === resourceId && rt.resourceType === resourceType,
    );
  }

  async findResourcesByTag(
    tagId: string,
    filters: TagResourceFilters,
  ): Promise<{
    resources: Array<{ resourceId: string; resourceType: string; taggedAt: Date }>;
    total: number;
  }> {
    let entries = this.resourceTags.filter((rt) => rt.tagId === tagId);
    if (filters.resourceType) {
      entries = entries.filter((rt) => rt.resourceType === filters.resourceType);
    }

    const total = entries.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? entries.length;
    entries = entries.slice(offset, offset + limit);

    return {
      resources: entries.map((rt) => ({
        resourceId: rt.resourceId,
        resourceType: rt.resourceType,
        taggedAt: rt.taggedAt,
      })),
      total,
    };
  }
}
