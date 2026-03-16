import type { Tag } from "../../domain/entities/tag.entity.js";

export interface ResourceTag {
  tagId: string;
  resourceId: string;
  resourceType: string;
}

export interface ITagRepository {
  saveTag(tag: Tag): Promise<void>;
  findBySlug(slug: string): Promise<Tag | null>;
  tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void>;
  untagResource(tagId: string, resourceId: string, resourceType: string): Promise<boolean>;
  findResourcesByTag(tagId: string): Promise<ResourceTag[]>;
}
