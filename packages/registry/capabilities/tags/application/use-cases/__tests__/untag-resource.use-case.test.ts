import { describe, it, expect, beforeEach } from "vitest";
import { UntagResource } from "../untag-resource.use-case.js";
import { InMemoryTagRepository } from "./mocks/in-memory-tag-repository.mock.js";
import { createTestTag } from "./fixtures/tag.fixture.js";
import { TagNotFound } from "../../../domain/errors/tag-not-found.error.js";
import { ResourceTagNotFound } from "../../../domain/errors/resource-tag-not-found.error.js";

describe("UntagResource use case", () => {
  let repo: InMemoryTagRepository;
  let untagResource: UntagResource;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    untagResource = new UntagResource(repo);
  });

  it("untags a resource successfully", async () => {
    const tag = createTestTag();
    await repo.saveTag(tag);
    await repo.tagResource(tag.id, "post-1", "post");

    const result = await untagResource.execute({
      tagSlug: "javascript",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().untaggedAt).toBeInstanceOf(Date);
  });

  it("fails when tag does not exist", async () => {
    const result = await untagResource.execute({
      tagSlug: "nonexistent",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(TagNotFound);
  });

  it("fails when resource is not tagged", async () => {
    await repo.saveTag(createTestTag());

    const result = await untagResource.execute({
      tagSlug: "javascript",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ResourceTagNotFound);
  });
});
