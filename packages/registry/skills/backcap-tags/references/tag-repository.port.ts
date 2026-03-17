import type { Tag } from "../../domain/entities/tag.entity.js";

export interface TagResourceFilters {
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export interface ITagRepository {
  saveTag(tag: Tag): Promise<void>;
  findBySlug(slug: string): Promise<Tag | undefined>;
  tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void>;
  untagResource(tagId: string, resourceId: string, resourceType: string): Promise<void>;
  findResourcesByTag(
    tagId: string,
    filters: TagResourceFilters,
  ): Promise<{
    resources: Array<{ resourceId: string; resourceType: string; taggedAt: Date }>;
    total: number;
  }>;
  isResourceTagged(tagId: string, resourceId: string, resourceType: string): Promise<boolean>;
}
