import { describe, it, expect, beforeEach } from "vitest";
import { PostComment } from "../use-cases/post-comment.use-case.js";
import { InMemoryCommentRepository } from "./mocks/in-memory-comment-repository.mock.js";

describe("PostComment use case", () => {
  let repo: InMemoryCommentRepository;
  let postComment: PostComment;

  beforeEach(() => {
    repo = new InMemoryCommentRepository();
    postComment = new PostComment(repo);
  });

  it("posts a comment successfully", async () => {
    const result = await postComment.execute({
      content: "Great post!",
      authorId: "user-1",
      resourceId: "post-1",
      resourceType: "post",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.commentId).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(event.authorId).toBe("user-1");
    expect(event.resourceType).toBe("post");
  });

  it("posts a threaded comment", async () => {
    const parentResult = await postComment.execute({
      content: "Parent comment",
      authorId: "user-1",
      resourceId: "post-1",
      resourceType: "post",
    });
    const parentId = parentResult.unwrap().output.commentId;

    const result = await postComment.execute({
      content: "Reply!",
      authorId: "user-1",
      resourceId: "post-1",
      resourceType: "post",
      parentId,
    });
    expect(result.isOk()).toBe(true);
  });

  it("fails when parent comment does not exist", async () => {
    const result = await postComment.execute({
      content: "Reply!",
      authorId: "user-1",
      resourceId: "post-1",
      resourceType: "post",
      parentId: "non-existent-parent",
    });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty content", async () => {
    const result = await postComment.execute({
      content: "",
      authorId: "user-1",
      resourceId: "post-1",
      resourceType: "post",
    });
    expect(result.isFail()).toBe(true);
  });
});
