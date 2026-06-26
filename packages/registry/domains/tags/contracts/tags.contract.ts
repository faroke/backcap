import type { Result } from "../shared/result.js";
import type { CreateTagInput, CreateTagOutput } from "../application/dto/create-tag.dto.js";
import type { TagResourceInput, TagResourceOutput } from "../application/dto/tag-resource.dto.js";
import type { UntagResourceInput, UntagResourceOutput } from "../application/dto/untag-resource.dto.js";
import type { ListByTagInput, ListByTagOutput } from "../application/dto/list-by-tag.dto.js";
import type { InvalidTagSlug } from "../domain/errors/invalid-tag-slug.error.js";
import type { TagAlreadyExists } from "../domain/errors/tag-already-exists.error.js";
import type { TagNotFound } from "../domain/errors/tag-not-found.error.js";
import type { ResourceAlreadyTagged } from "../domain/errors/resource-already-tagged.error.js";
import type { ResourceTagNotFound } from "../domain/errors/resource-tag-not-found.error.js";

export type { CreateTagInput, CreateTagOutput };
export type { TagResourceInput, TagResourceOutput };
export type { UntagResourceInput, UntagResourceOutput };
export type { ListByTagInput, ListByTagOutput };

export interface ITagsService {
  createTag(
    input: CreateTagInput,
  ): Promise<Result<CreateTagOutput, InvalidTagSlug | TagAlreadyExists>>;
  tagResource(
    input: TagResourceInput,
  ): Promise<Result<TagResourceOutput, TagNotFound | ResourceAlreadyTagged>>;
  untagResource(
    input: UntagResourceInput,
  ): Promise<Result<UntagResourceOutput, TagNotFound | ResourceTagNotFound>>;
  listByTag(input: ListByTagInput): Promise<Result<ListByTagOutput, TagNotFound>>;
}
