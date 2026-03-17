import { Result } from "../../shared/result.js";
import { Tag } from "../../domain/entities/tag.entity.js";
import { TagCreated } from "../../domain/events/tag-created.event.js";
import { TagAlreadyExists } from "../../domain/errors/tag-already-exists.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { CreateTagInput, CreateTagOutput } from "../dto/create-tag.dto.js";

export class CreateTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: CreateTagInput,
  ): Promise<Result<{ output: CreateTagOutput; event: TagCreated }, Error>> {
    const id = crypto.randomUUID();
    const tagResult = Tag.create({ id, name: input.name });
    if (tagResult.isFail()) {
      return Result.fail(tagResult.unwrapError());
    }

    const tag = tagResult.unwrap();

    const existing = await this.tagRepository.findBySlug(tag.slug.value);
    if (existing) {
      return Result.fail(TagAlreadyExists.create(tag.slug.value));
    }

    await this.tagRepository.saveTag(tag);

    const event = new TagCreated(tag.id, tag.slug.value);

    return Result.ok({
      output: { tagId: tag.id, slug: tag.slug.value, createdAt: tag.createdAt },
      event,
    });
  }
}
