import { describe, it, expect } from "vitest";
import { Comment } from "../entities/comment.entity.js";

describe("Comment entity", () => {
  const validParams = {
    id: "comment-1",
    content: "Great article!",
    authorId: "user-1",
    resourceId: "article-1",
    resourceType: "article",
  };

  it("creates a valid comment", () => {
    const result = Comment.create(validParams);
    expect(result.isOk()).toBe(true);
    const comment = result.unwrap();
    expect(comment.id).toBe("comment-1");
    expect(comment.content.value).toBe("Great article!");
    expect(comment.authorId).toBe("user-1");
    expect(comment.resourceId).toBe("article-1");
    expect(comment.resourceType).toBe("article");
    expect(comment.parentId).toBeUndefined();
    expect(comment.createdAt).toBeInstanceOf(Date);
    expect(comment.deletedAt).toBeUndefined();
  });

  it("creates a reply comment with parentId", () => {
    const result = Comment.create({ ...validParams, parentId: "comment-0" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().parentId).toBe("comment-0");
  });

  it("fails with empty content", () => {
    const result = Comment.create({ ...validParams, content: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with content over 10000 chars", () => {
    const result = Comment.create({ ...validParams, content: "a".repeat(10001) });
    expect(result.isFail()).toBe(true);
  });

  it("softDelete sets deletedAt", () => {
    const comment = Comment.create(validParams).unwrap();
    expect(comment.deletedAt).toBeUndefined();
    const deleted = comment.softDelete();
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    // Original unchanged
    expect(comment.deletedAt).toBeUndefined();
  });
});
