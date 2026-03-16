import type { Result } from "../shared/result.js";
import type { ResourceTag } from "../application/ports/tag-repository.port.js";

export interface TagsCreateInput {
  name: string;
}

export interface TagsTagResourceInput {
  tagSlug: string;
  resourceId: string;
  resourceType: string;
}

export interface TagsUntagResourceInput {
  tagSlug: string;
  resourceId: string;
  resourceType: string;
}

export interface TagsListByTagInput {
  tagSlug: string;
}

export interface ITagsService {
  createTag(input: TagsCreateInput): Promise<Result<{ tagId: string; slug: string }, Error>>;
  tagResource(input: TagsTagResourceInput): Promise<Result<{ tagId: string; resourceId: string }, Error>>;
  untagResource(input: TagsUntagResourceInput): Promise<Result<{ tagId: string; resourceId: string }, Error>>;
  listByTag(input: TagsListByTagInput): Promise<Result<ResourceTag[], Error>>;
}
