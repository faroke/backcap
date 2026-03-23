export type {
  ITagsService,
  CreateTagInput,
  CreateTagOutput,
  TagResourceInput,
  TagResourceOutput,
  UntagResourceInput,
  UntagResourceOutput,
  ListByTagInput,
  ListByTagOutput,
} from "./tags.contract.js";

export { createTagsService } from "./tags.factory.js";
export type { TagsDeps } from "./tags.factory.js";
