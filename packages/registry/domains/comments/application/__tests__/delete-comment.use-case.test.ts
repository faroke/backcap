import { describe, it, expect, beforeEach } from "vitest";
import { DeleteComment } from "../use-cases/delete-comment.use-case.js";
import { InMemoryCommentRepository } from "./mocks/in-memory-comment-repository.mock.js";
import { createTestComment } from "./fixtures/comment.fixture.js";
import { CommentNotFound } from "../../domain/errors/comment-not-found.error.js";
import { UnauthorizedDelete } from "../../domain/errors/unauthorized-delete.error.js";

describe("DeleteComment use case", () => {
  let repo: InMemoryCommentRepository;
  let deleteComment: DeleteComment;

  beforeEach(() => {
    repo = new InMemoryCommentRepository();
    deleteComment = new DeleteComment(repo);
  });

  it("deletes a comment when requester is the author", async () => {
    await repo.save(createTestComment({ id: "c-1", authorId: "user-1" }));

    const result = await deleteComment.execute({
      commentId: "c-1",
      requesterId: "user-1",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().deletedAt).toBeInstanceOf(Date);
  });

  it("fails when comment does not exist", async () => {
    const result = await deleteComment.execute({
      commentId: "nonexistent",
      requesterId: "user-1",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CommentNotFound);
  });

  it("fails when requester is not the author", async () => {
    await repo.save(createTestComment({ id: "c-2", authorId: "user-1" }));

    const result = await deleteComment.execute({
      commentId: "c-2",
      requesterId: "user-other",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UnauthorizedDelete);
  });
});
