import { describe, it, expect, beforeEach } from "vitest";
import { ListComments } from "../list-comments.use-case.js";
import { InMemoryCommentRepository } from "./mocks/in-memory-comment-repository.mock.js";
import { createTestComment } from "./fixtures/comment.fixture.js";

describe("ListComments use case", () => {
  let repo: InMemoryCommentRepository;
  let listComments: ListComments;

  beforeEach(() => {
    repo = new InMemoryCommentRepository();
    listComments = new ListComments(repo);
  });

  it("lists comments for a resource", async () => {
    await repo.save(createTestComment({ id: "c-1" }));
    await repo.save(createTestComment({ id: "c-2" }));

    const result = await listComments.execute({
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().comments).toHaveLength(2);
    expect(result.unwrap().total).toBe(2);
  });

  it("excludes deleted comments by default", async () => {
    const comment = createTestComment({ id: "c-del" });
    const deleted = comment.softDelete().unwrap();
    await repo.save(deleted);

    const result = await listComments.execute({
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.unwrap().comments).toHaveLength(0);
  });

  it("includes deleted comments when requested", async () => {
    const comment = createTestComment({ id: "c-del2" });
    const deleted = comment.softDelete().unwrap();
    await repo.save(deleted);

    const result = await listComments.execute({
      resourceId: "post-1",
      resourceType: "post",
      includeDeleted: true,
    });
    expect(result.unwrap().comments).toHaveLength(1);
  });
});
