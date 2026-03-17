import type { ITagRepository } from "../application/ports/tag-repository.port.js";
import { CreateTag } from "../application/use-cases/create-tag.use-case.js";
import { TagResource } from "../application/use-cases/tag-resource.use-case.js";
import { UntagResource } from "../application/use-cases/untag-resource.use-case.js";
import { ListByTag } from "../application/use-cases/list-by-tag.use-case.js";
import type { ITagsService } from "./tags.contract.js";

export type TagsDeps = {
  tagRepository: ITagRepository;
};

export function createTagsService(deps: TagsDeps): ITagsService {
  const createTag = new CreateTag(deps.tagRepository);
  const tagResource = new TagResource(deps.tagRepository);
  const untagResource = new UntagResource(deps.tagRepository);
  const listByTag = new ListByTag(deps.tagRepository);

  return {
    createTag: (input) =>
      createTag.execute(input).then((r) => r.map((v) => v.output)),
    tagResource: (input) => tagResource.execute(input),
    untagResource: (input) => untagResource.execute(input),
    listByTag: (input) => listByTag.execute(input),
  };
}
