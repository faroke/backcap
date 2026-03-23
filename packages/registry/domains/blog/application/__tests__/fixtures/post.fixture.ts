import { Post } from "../../../domain/entities/post.entity.js";

export function createTestPost(
  overrides?: Partial<{
    id: string;
    title: string;
    slug: string;
    content: string;
    authorId: string;
    status: "draft" | "published";
  }>,
): Post {
  const result = Post.create({
    id: overrides?.id ?? "test-post-1",
    title: overrides?.title ?? "Test Post Title",
    slug: overrides?.slug ?? "test-post-title",
    content: overrides?.content ?? "This is the test post content.",
    authorId: overrides?.authorId ?? "author-1",
    status: overrides?.status ?? "draft",
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test post: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
