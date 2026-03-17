import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import { ResourceAlreadyTagged } from "../../domain/errors/resource-already-tagged.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { TagResourceInput, TagResourceOutput } from "../dto/tag-resource.dto.js";

export class TagResource {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: TagResourceInput,
  ): Promise<Result<TagResourceOutput, TagNotFound | ResourceAlreadyTagged>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    const alreadyTagged = await this.tagRepository.isResourceTagged(
      tag.id,
      input.resourceId,
      input.resourceType,
    );
    if (alreadyTagged) {
      return Result.fail(
        ResourceAlreadyTagged.create(input.tagSlug, input.resourceId, input.resourceType),
      );
    }

    await this.tagRepository.tagResource(tag.id, input.resourceId, input.resourceType);

    return Result.ok({ taggedAt: new Date() });
  }
}
