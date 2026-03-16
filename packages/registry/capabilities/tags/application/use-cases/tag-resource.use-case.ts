// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import type { ITagRepository } from "../ports/tag-repository.port.js";
import type { TagResourceInput } from "../dto/tag-resource.dto.js";

export class TagResource {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(
    input: TagResourceInput,
  ): Promise<Result<{ tagId: string; resourceId: string }, Error>> {
    const tag = await this.tagRepository.findBySlug(input.tagSlug);
    if (!tag) {
      return Result.fail(TagNotFound.create(input.tagSlug));
    }

    await this.tagRepository.tagResource(tag.id, input.resourceId, input.resourceType);
    return Result.ok({ tagId: tag.id, resourceId: input.resourceId });
  }
}
