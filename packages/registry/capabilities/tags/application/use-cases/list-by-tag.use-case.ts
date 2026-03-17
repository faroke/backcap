import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { ListByTagInput, ListByTagOutput } from "../dto/list-by-tag.dto.js";

export class ListByTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: ListByTagInput,
  ): Promise<Result<ListByTagOutput, TagNotFound>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    const { resources, total } = await this.tagRepository.findResourcesByTag(
      tag.id,
      {
        resourceType: input.resourceType,
        limit: input.limit,
        offset: input.offset,
      },
    );

    return Result.ok({ resources, total });
  }
}
