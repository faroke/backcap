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
      content: "Great article!",
      authorId: "user-1",
      resourceId: "article-1",
      resourceType: "article",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.commentId).toBeDefined();
    expect(output.event.authorId).toBe("user-1");
    expect(output.event.resourceId).toBe("article-1");
    expect(output.event.resourceType).toBe("article");

    // Verify comment was stored
    const saved = await repo.findById(output.commentId);
    expect(saved).not.toBeNull();
    expect(saved!.content.value).toBe("Great article!");
  });

  it("posts a reply comment with parentId", async () => {
    const result = await postComment.execute({
      content: "I agree!",
      authorId: "user-2",
      resourceId: "article-1",
      resourceType: "article",
      parentId: "comment-0",
    });

    expect(result.isOk()).toBe(true);
    const saved = await repo.findById(result.unwrap().commentId);
    expect(saved!.parentId).toBe("comment-0");
  });

  it("rejects empty content", async () => {
    const result = await postComment.execute({
      content: "",
      authorId: "user-1",
      resourceId: "article-1",
      resourceType: "article",
    });

    expect(result.isFail()).toBe(true);
  });

  it("rejects content over 10000 chars", async () => {
    const result = await postComment.execute({
      content: "a".repeat(10001),
      authorId: "user-1",
      resourceId: "article-1",
      resourceType: "article",
    });

    expect(result.isFail()).toBe(true);
  });
});
