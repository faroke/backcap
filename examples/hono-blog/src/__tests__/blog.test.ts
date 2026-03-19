import { describe, it, expect, beforeEach } from "vitest";
import { CreatePost } from "../capabilities/blog/application/use-cases/create-post.use-case.js";
import { PublishPost } from "../capabilities/blog/application/use-cases/publish-post.use-case.js";
import { GetPost } from "../capabilities/blog/application/use-cases/get-post.use-case.js";
import { ListPosts } from "../capabilities/blog/application/use-cases/list-posts.use-case.js";
import type { IPostRepository } from "../capabilities/blog/application/ports/post-repository.port.js";
import { Post } from "../capabilities/blog/domain/entities/post.entity.js";

class InMemoryPostRepository implements IPostRepository {
  private posts = new Map<string, Post>();

  async findById(id: string) {
    return this.posts.get(id) ?? null;
  }
  async findBySlug(slug: string) {
    for (const post of this.posts.values()) {
      if (post.slug.value === slug) return post;
    }
    return null;
  }
  async findAll(filter?: { authorId?: string; status?: "draft" | "published" }) {
    let posts = [...this.posts.values()];
    if (filter?.authorId) posts = posts.filter((p) => p.authorId === filter.authorId);
    if (filter?.status) posts = posts.filter((p) => p.status === filter.status);
    return posts;
  }
  async save(post: Post) {
    this.posts.set(post.id, post);
  }
}

describe("Blog capability", () => {
  let repo: InMemoryPostRepository;
  let createPost: CreatePost;
  let publishPost: PublishPost;
  let getPost: GetPost;
  let listPosts: ListPosts;

  beforeEach(() => {
    repo = new InMemoryPostRepository();
    createPost = new CreatePost(repo);
    publishPost = new PublishPost(repo);
    getPost = new GetPost(repo);
    listPosts = new ListPosts(repo);
  });

  it("creates a post with auto-generated slug", async () => {
    const result = await createPost.execute({
      title: "Hello World",
      content: "First post",
      authorId: "user-1",
    });
    expect(result.isOk()).toBe(true);
    const { output } = result.unwrap();
    expect(output.slug).toBe("hello-world");
    expect(output.postId).toBeDefined();
  });

  it("creates a post with custom slug", async () => {
    const result = await createPost.execute({
      title: "Hello World",
      slug: "custom-slug",
      content: "First post",
      authorId: "user-1",
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().output.slug).toBe("custom-slug");
  });

  it("rejects invalid slug", async () => {
    const result = await createPost.execute({
      title: "Hello World",
      slug: "INVALID SLUG!",
      content: "First post",
      authorId: "user-1",
    });
    expect(result.isFail()).toBe(true);
  });

  it("publishes a draft post", async () => {
    const createResult = await createPost.execute({
      title: "My Post",
      content: "Content",
      authorId: "user-1",
    });
    const { output: created } = createResult.unwrap();

    const publishResult = await publishPost.execute({ postId: created.postId });
    expect(publishResult.isOk()).toBe(true);
    const { output, event } = publishResult.unwrap();
    expect(output.slug).toBe("my-post");
    expect(event.postId).toBe(created.postId);
  });

  it("rejects publishing an already published post", async () => {
    const createResult = await createPost.execute({
      title: "My Post",
      content: "Content",
      authorId: "user-1",
    });
    const { output: created } = createResult.unwrap();
    await publishPost.execute({ postId: created.postId });

    const secondPublish = await publishPost.execute({ postId: created.postId });
    expect(secondPublish.isFail()).toBe(true);
  });

  it("gets a post by ID", async () => {
    const createResult = await createPost.execute({
      title: "My Post",
      content: "Content here",
      authorId: "user-1",
    });
    const { output: created } = createResult.unwrap();

    const getResult = await getPost.execute({ postId: created.postId });
    expect(getResult.isOk()).toBe(true);
    const post = getResult.unwrap();
    expect(post.title).toBe("My Post");
    expect(post.content).toBe("Content here");
  });

  it("returns error for non-existent post", async () => {
    const result = await getPost.execute({ postId: "non-existent" });
    expect(result.isFail()).toBe(true);
  });

  it("lists all posts", async () => {
    await createPost.execute({ title: "Post 1", content: "C1", authorId: "user-1" });
    await createPost.execute({ title: "Post 2", content: "C2", authorId: "user-2" });

    const result = await listPosts.execute({});
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().posts).toHaveLength(2);
  });

  it("filters posts by author", async () => {
    await createPost.execute({ title: "Post 1", content: "C1", authorId: "user-1" });
    await createPost.execute({ title: "Post 2", content: "C2", authorId: "user-2" });

    const result = await listPosts.execute({ authorId: "user-1" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().posts).toHaveLength(1);
    expect(result.unwrap().posts[0].authorId).toBe("user-1");
  });
});
