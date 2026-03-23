import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import { ResourceTagNotFound } from "../../domain/errors/resource-tag-not-found.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { UntagResourceInput, UntagResourceOutput } from "../dto/untag-resource.dto.js";

export class UntagResource {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: UntagResourceInput,
  ): Promise<Result<UntagResourceOutput, TagNotFound | ResourceTagNotFound>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    const isTagged = await this.tagRepository.isResourceTagged(
      tag.id,
      input.resourceId,
      input.resourceType,
    );
    if (!isTagged) {
      return Result.fail(
        ResourceTagNotFound.create(input.tagSlug, input.resourceId, input.resourceType),
      );
    }

    await this.tagRepository.untagResource(tag.id, input.resourceId, input.resourceType);

    return Result.ok({ untaggedAt: new Date() });
  }
}
