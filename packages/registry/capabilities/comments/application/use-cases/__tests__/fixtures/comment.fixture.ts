import { Comment } from "../../../../domain/entities/comment.entity.js";

export function createTestComment(
  overrides?: Partial<{
    id: string;
    content: string;
    authorId: string;
    resourceId: string;
    resourceType: string;
    parentId: string;
  }>,
): Comment {
  const result = Comment.create({
    id: overrides?.id ?? "test-comment-1",
    content: overrides?.content ?? "Test comment content",
    authorId: overrides?.authorId ?? "author-1",
    resourceId: overrides?.resourceId ?? "post-1",
    resourceType: overrides?.resourceType ?? "post",
    parentId: overrides?.parentId,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test comment: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
