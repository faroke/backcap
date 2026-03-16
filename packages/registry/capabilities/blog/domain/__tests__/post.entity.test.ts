import { describe, it, expect } from "vitest";
import { Post } from "../entities/post.entity.js";
import { InvalidSlug } from "../errors/invalid-slug.error.js";
import { PostAlreadyPublished } from "../errors/post-already-published.error.js";

describe("Post entity", () => {
  const validParams = {
    id: "post-1",
    title: "Hello World",
    slug: "hello-world",
    content: "Some content here.",
    authorId: "author-1",
  };

  it("creates a valid draft post", () => {
    const result = Post.create(validParams);
    expect(result.isOk()).toBe(true);
    const post = result.unwrap();
    expect(post.id).toBe("post-1");
    expect(post.title).toBe("Hello World");
    expect(post.slug.value).toBe("hello-world");
    expect(post.content).toBe("Some content here.");
    expect(post.authorId).toBe("author-1");
    expect(post.status).toBe("draft");
    expect(post.createdAt).toBeInstanceOf(Date);
    expect(post.publishedAt).toBeNull();
  });

  it("creates a post with an auto-generated slug from title when slug is omitted", () => {
    const result = Post.create({
      id: "post-2",
      title: "My Awesome Post!",
      content: "Content here.",
      authorId: "author-1",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().slug.value).toBe("my-awesome-post");
  });

  it("creates a post with explicit published status", () => {
    const result = Post.create({ ...validParams, status: "published" });
    expect(result.unwrap().status).toBe("published");
  });

  it("fails with an invalid slug", () => {
    const result = Post.create({ ...validParams, slug: "Invalid Slug!" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidSlug);
  });

  it("publish() transitions draft to published and returns event", () => {
    const post = Post.create(validParams).unwrap();
    const publishResult = post.publish();
    expect(publishResult.isOk()).toBe(true);
    const { post: published, event } = publishResult.unwrap();
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeInstanceOf(Date);
    expect(event.postId).toBe("post-1");
    expect(event.slug).toBe("hello-world");
    // Original post is unchanged (immutable)
    expect(post.status).toBe("draft");
    expect(post.publishedAt).toBeNull();
  });

  it("publish() fails when post is already published", () => {
    const post = Post.create({ ...validParams, status: "published" }).unwrap();
    const result = post.publish();
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PostAlreadyPublished);
  });
});
