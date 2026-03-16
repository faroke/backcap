// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import { ResourceTagNotFound } from "../../domain/errors/resource-tag-not-found.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { UntagResourceInput } from "../dto/untag-resource.dto.js";

export class UntagResource {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: UntagResourceInput,
  ): Promise<Result<{ tagId: string; resourceId: string }, Error>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    const removed = await this.tagRepository.untagResource(
      tag.id,
      input.resourceId,
      input.resourceType,
    );

    if (!removed) {
      return Result.fail(ResourceTagNotFound.create(input.resourceId, input.tagSlug));
    }

    return Result.ok({ tagId: tag.id, resourceId: input.resourceId });
  }
}
