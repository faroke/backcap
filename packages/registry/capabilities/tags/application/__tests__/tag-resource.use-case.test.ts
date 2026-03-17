import { describe, it, expect, beforeEach } from "vitest";
import { TagResource } from "../use-cases/tag-resource.use-case.js";
import { InMemoryTagRepository } from "./mocks/in-memory-tag-repository.mock.js";
import { createTestTag } from "./fixtures/tag.fixture.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";
import { ResourceAlreadyTagged } from "../../domain/errors/resource-already-tagged.error.js";

describe("TagResource use case", () => {
  let repo: InMemoryTagRepository;
  let tagResource: TagResource;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    tagResource = new TagResource(repo);
  });

  it("tags a resource successfully", async () => {
    await repo.saveTag(createTestTag());

    const result = await tagResource.execute({
      tagSlug: "javascript",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().taggedAt).toBeInstanceOf(Date);
  });

  it("fails when tag does not exist", async () => {
    const result = await tagResource.execute({
      tagSlug: "nonexistent",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(TagNotFound);
  });

  it("fails when resource is already tagged", async () => {
    await repo.saveTag(createTestTag());

    await tagResource.execute({
      tagSlug: "javascript",
      resourceId: "post-1",
      resourceType: "post",
    });

    const result = await tagResource.execute({
      tagSlug: "javascript",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ResourceAlreadyTagged);
  });
});
