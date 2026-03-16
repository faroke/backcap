// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Tag } from "../../domain/entities/tag.entity.js";
import { TagSlug } from "../../domain/value-objects/tag-slug.vo.js";
import { TagCreated } from "../../domain/events/tag-created.event.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { CreateTagInput } from "../dto/create-tag.dto.js";

export class CreateTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: CreateTagInput,
  ): Promise<Result<{ tagId: string; slug: string; event: TagCreated }, Error>> {
    const slugResult = TagSlug.fromName(input.name);
    if (slugResult.isFail()) {
      return Result.fail(slugResult.unwrapError());
    }

    const slug = slugResult.unwrap();

    // Check if tag with this slug already exists
    const existing = await this.tagRepository.findBySlug(slug.value);
    if (existing) {
      return Result.ok({
        tagId: existing.id,
        slug: existing.slug.value,
        event: new TagCreated(existing.id, existing.slug.value),
      });
    }

    const id = crypto.randomUUID();
    const tagResult = Tag.create({ id, name: input.name, slug: slug.value });
    if (tagResult.isFail()) {
      return Result.fail(tagResult.unwrapError());
    }

    const tag = tagResult.unwrap();
    await this.tagRepository.saveTag(tag);

    const event = new TagCreated(tag.id, tag.slug.value);
    return Result.ok({ tagId: tag.id, slug: tag.slug.value, event });
  }
}
