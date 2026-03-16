// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import type { ITagRepository, ResourceTag } from "../ports/tag-repository.port.js";
import type { ListByTagInput } from "../dto/list-by-tag.dto.js";

export class ListByTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: ListByTagInput,
  ): Promise<Result<ResourceTag[], Error>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    const resources = await this.tagRepository.findResourcesByTag(tag.id);
    return Result.ok(resources);
  }
}
