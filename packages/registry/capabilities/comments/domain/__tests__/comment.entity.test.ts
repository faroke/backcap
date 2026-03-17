import { describe, it, expect } from "vitest";
import { Comment } from "../entities/comment.entity.js";

describe("Comment entity", () => {
  const validParams = {
    id: "comment-1",
    content: "A great comment",
    authorId: "author-1",
    resourceId: "post-1",
    resourceType: "post",
  };

  it("creates a comment with required fields", () => {
    const result = Comment.create(validParams);
    expect(result.isOk()).toBe(true);
    const comment = result.unwrap();
    expect(comment.id).toBe("comment-1");
    expect(comment.content.value).toBe("A great comment");
    expect(comment.authorId).toBe("author-1");
    expect(comment.resourceId).toBe("post-1");
    expect(comment.resourceType).toBe("post");
    expect(comment.parentId).toBeUndefined();
    expect(comment.deletedAt).toBeUndefined();
  });

  it("creates a threaded comment with parentId", () => {
    const result = Comment.create({ ...validParams, parentId: "parent-1" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().parentId).toBe("parent-1");
  });

  it("fails with empty content", () => {
    const result = Comment.create({ ...validParams, content: "" });
    expect(result.isFail()).toBe(true);
  });

  it("soft deletes a comment", () => {
    const comment = Comment.create(validParams).unwrap();
    const deleteResult = comment.softDelete();
    expect(deleteResult.isOk()).toBe(true);
    const deleted = deleteResult.unwrap();
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    // original is unchanged
    expect(comment.deletedAt).toBeUndefined();
  });

  it("fails to soft delete an already deleted comment", () => {
    const comment = Comment.create(validParams).unwrap();
    const deleted = comment.softDelete().unwrap();
    const result = deleted.softDelete();
    expect(result.isFail()).toBe(true);
  });
});
