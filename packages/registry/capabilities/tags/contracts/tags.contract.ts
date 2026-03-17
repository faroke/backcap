import type { Result } from "../shared/result.js";
import type { CreateTagInput, CreateTagOutput } from "../application/dto/create-tag.dto.js";
import type { TagResourceInput, TagResourceOutput } from "../application/dto/tag-resource.dto.js";
import type { UntagResourceInput, UntagResourceOutput } from "../application/dto/untag-resource.dto.js";
import type { ListByTagInput, ListByTagOutput } from "../application/dto/list-by-tag.dto.js";

export type { CreateTagInput, CreateTagOutput };
export type { TagResourceInput, TagResourceOutput };
export type { UntagResourceInput, UntagResourceOutput };
export type { ListByTagInput, ListByTagOutput };

export interface ITagsService {
  createTag(input: CreateTagInput): Promise<Result<CreateTagOutput, Error>>;
  tagResource(input: TagResourceInput): Promise<Result<TagResourceOutput, Error>>;
  untagResource(input: UntagResourceInput): Promise<Result<UntagResourceOutput, Error>>;
  listByTag(input: ListByTagInput): Promise<Result<ListByTagOutput, Error>>;
}
