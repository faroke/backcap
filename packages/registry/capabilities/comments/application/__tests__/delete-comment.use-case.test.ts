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

  it("deletes a comment by its author", async () => {
    const comment = createTestComment({ id: "comment-1", authorId: "user-1" });
    await repo.save(comment);

    const result = await deleteComment.execute({
      commentId: "comment-1",
      requesterId: "user-1",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().commentId).toBe("comment-1");

    // Verify soft delete
    const saved = await repo.findById("comment-1");
    expect(saved!.deletedAt).toBeInstanceOf(Date);
  });

  it("fails when comment not found", async () => {
    const result = await deleteComment.execute({
      commentId: "nonexistent",
      requesterId: "user-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(CommentNotFound);
  });

  it("fails when requester is not the author", async () => {
    const comment = createTestComment({ id: "comment-1", authorId: "user-1" });
    await repo.save(comment);

    const result = await deleteComment.execute({
      commentId: "comment-1",
      requesterId: "user-2",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UnauthorizedDelete);
  });
});
