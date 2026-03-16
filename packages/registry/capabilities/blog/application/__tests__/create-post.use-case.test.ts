import { describe, it, expect, beforeEach } from "vitest";
import { CreatePost } from "../use-cases/create-post.use-case.js";
import { PublishPost } from "../use-cases/publish-post.use-case.js";
import { GetPost } from "../use-cases/get-post.use-case.js";
import { ListPosts } from "../use-cases/list-posts.use-case.js";
import { InMemoryPostRepository } from "./mocks/post-repository.mock.js";
import { createTestPost } from "./fixtures/post.fixture.js";
import { InvalidSlug } from "../../domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../domain/errors/post-already-published.error.js";

describe("CreatePost use case", () => {
  let postRepo: InMemoryPostRepository;
  let createPost: CreatePost;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    createPost = new CreatePost(postRepo);
  });

  it("creates a new post successfully with an explicit slug", async () => {
    const result = await createPost.execute({
      title: "My First Post",
      slug: "my-first-post",
      content: "Hello content.",
      authorId: "author-1",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.postId).toBeDefined();
    expect(output.slug).toBe("my-first-post");
    expect(event.authorId).toBe("author-1");
    expect(event.postId).toBe(output.postId);

    const saved = await postRepo.findById(output.postId);
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe("draft");
  });

  it("creates a post with auto-generated slug when slug is omitted", async () => {
    const result = await createPost.execute({
      title: "Auto Slug Post",
      content: "Some content.",
      authorId: "author-2",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().output.slug).toBe("auto-slug-post");
  });

  it("fails with an invalid explicit slug", async () => {
    const result = await createPost.execute({
      title: "Bad Slug",
      slug: "Bad Slug!!!",
      content: "Content.",
      authorId: "author-1",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidSlug);
  });
});

describe("PublishPost use case", () => {
  let postRepo: InMemoryPostRepository;
  let publishPost: PublishPost;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    publishPost = new PublishPost(postRepo);
  });

  it("publishes a draft post successfully", async () => {
    const post = createTestPost({ id: "post-draft-1" });
    await postRepo.save(post);

    const result = await publishPost.execute({ postId: "post-draft-1" });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.postId).toBe("post-draft-1");
    expect(output.publishedAt).toBeInstanceOf(Date);
    expect(event.postId).toBe("post-draft-1");

    const saved = await postRepo.findById("post-draft-1");
    expect(saved!.status).toBe("published");
  });

  it("fails when post does not exist", async () => {
    const result = await publishPost.execute({ postId: "nonexistent" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PostNotFound);
  });

  it("fails when post is already published", async () => {
    const post = createTestPost({ id: "post-pub-1", status: "published" });
    await postRepo.save(post);

    const result = await publishPost.execute({ postId: "post-pub-1" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PostAlreadyPublished);
  });
});

describe("GetPost use case", () => {
  let postRepo: InMemoryPostRepository;
  let getPost: GetPost;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    getPost = new GetPost(postRepo);
  });

  it("returns a post by id", async () => {
    const post = createTestPost({ id: "post-get-1", title: "Get Me" });
    await postRepo.save(post);

    const result = await getPost.execute({ postId: "post-get-1" });
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.postId).toBe("post-get-1");
    expect(output.title).toBe("Get Me");
    expect(output.status).toBe("draft");
    expect(output.publishedAt).toBeNull();
  });

  it("fails when post does not exist", async () => {
    const result = await getPost.execute({ postId: "missing" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PostNotFound);
  });
});

describe("ListPosts use case", () => {
  let postRepo: InMemoryPostRepository;
  let listPosts: ListPosts;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    listPosts = new ListPosts(postRepo);
  });

  it("returns all posts when no filter is applied", async () => {
    await postRepo.save(createTestPost({ id: "p1", authorId: "a1" }));
    await postRepo.save(createTestPost({ id: "p2", authorId: "a2", slug: "another-post" }));

    const result = await listPosts.execute({});
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().posts).toHaveLength(2);
  });

  it("filters by authorId", async () => {
    await postRepo.save(createTestPost({ id: "p1", authorId: "a1" }));
    await postRepo.save(createTestPost({ id: "p2", authorId: "a2", slug: "another-post" }));

    const result = await listPosts.execute({ authorId: "a1" });
    expect(result.isOk()).toBe(true);
    const posts = result.unwrap().posts;
    expect(posts).toHaveLength(1);
    expect(posts[0].authorId).toBe("a1");
  });

  it("filters by status", async () => {
    await postRepo.save(createTestPost({ id: "p1", status: "draft" }));
    await postRepo.save(
      createTestPost({ id: "p2", status: "published", slug: "published-post" }),
    );

    const result = await listPosts.execute({ status: "published" });
    expect(result.isOk()).toBe(true);
    const posts = result.unwrap().posts;
    expect(posts).toHaveLength(1);
    expect(posts[0].status).toBe("published");
  });

  it("returns empty array when no posts match the filter", async () => {
    const result = await listPosts.execute({ authorId: "nobody" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().posts).toHaveLength(0);
  });
});
