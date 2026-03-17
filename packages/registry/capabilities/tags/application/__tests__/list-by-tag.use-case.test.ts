import { describe, it, expect, beforeEach } from "vitest";
import { ListByTag } from "../use-cases/list-by-tag.use-case.js";
import { InMemoryTagRepository } from "./mocks/in-memory-tag-repository.mock.js";
import { createTestTag } from "./fixtures/tag.fixture.js";
import { TagNotFound } from "../../domain/errors/tag-not-found.error.js";

describe("ListByTag use case", () => {
  let repo: InMemoryTagRepository;
  let listByTag: ListByTag;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    listByTag = new ListByTag(repo);
  });

  it("lists resources by tag", async () => {
    const tag = createTestTag();
    await repo.saveTag(tag);
    await repo.tagResource(tag.id, "post-1", "post");
    await repo.tagResource(tag.id, "post-2", "post");

    const result = await listByTag.execute({ tagSlug: "javascript" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().resources).toHaveLength(2);
    expect(result.unwrap().total).toBe(2);
  });

  it("fails when tag does not exist", async () => {
    const result = await listByTag.execute({ tagSlug: "nonexistent" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(TagNotFound);
  });

  it("returns empty when no resources tagged", async () => {
    await repo.saveTag(createTestTag());
    const result = await listByTag.execute({ tagSlug: "javascript" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().resources).toHaveLength(0);
  });
});
