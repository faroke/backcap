import type { Tag } from "../../../domain/entities/tag.entity.js";
import type { ITagRepository, ResourceTag } from "../../ports/tag-repository.port.js";

export class InMemoryTagRepository implements ITagRepository {
  private tags = new Map<string, Tag>();
  private resourceTags: ResourceTag[] = [];

  async saveTag(tag: Tag): Promise<void> {
    this.tags.set(tag.id, tag);
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return [...this.tags.values()].find((t) => t.slug.value === slug) ?? null;
  }

  async tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void> {
    // Avoid duplicates
    const exists = this.resourceTags.some(
      (rt) => rt.tagId === tagId && rt.resourceId === resourceId && rt.resourceType === resourceType,
    );
    if (!exists) {
      this.resourceTags.push({ tagId, resourceId, resourceType });
    }
  }

  async untagResource(tagId: string, resourceId: string, resourceType: string): Promise<boolean> {
    const index = this.resourceTags.findIndex(
      (rt) => rt.tagId === tagId && rt.resourceId === resourceId && rt.resourceType === resourceType,
    );
    if (index === -1) return false;
    this.resourceTags.splice(index, 1);
    return true;
  }

  async findResourcesByTag(tagId: string): Promise<ResourceTag[]> {
    return this.resourceTags.filter((rt) => rt.tagId === tagId);
  }
}
