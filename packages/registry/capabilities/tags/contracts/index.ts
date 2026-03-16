export type {
  TagsCreateInput,
  TagsTagResourceInput,
  TagsUntagResourceInput,
  TagsListByTagInput,
  ITagsService,
} from "./tags.contract.js";

export { createTagsService } from "./tags.factory.js";
export type { TagsServiceDeps } from "./tags.factory.js";
