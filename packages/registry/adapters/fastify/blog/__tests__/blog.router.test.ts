import { describe, it, expect, vi } from "vitest";
import { createBlogPlugin } from "../blog.router.js";
import { Result } from "../../../../capabilities/blog/shared/result.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostAlreadyPublished } from "../../../../capabilities/blog/domain/errors/post-already-published.error.js";

function createMockBlogService() {
  return {
    createPost: vi.fn(),
    publishPost: vi.fn(),
    getPost: vi.fn(),
    listPosts: vi.fn(),
  };
}

function createMockFastify() {
  const routes = new Map<string, Function>();

  function register(method: string) {
    return vi.fn((...args: unknown[]) => {
      const path = args[0] as string;
      const handler = args[args.length - 1] as Function;
      routes.set(`${method} ${path}`, handler);
    });
  }

  return {
    post: register("POST"),
    put: register("PUT"),
    get: register("GET"),
    getHandler: (method: string, path: string) => routes.get(`${method} ${path}`)!,
  };
}

function createMockRequest(body: Record<string, unknown> = {}, params: Record<string, string> = {}) {
  return { body, params };
}

function createMockReply() {
  const reply: any = {};
  reply.code = vi.fn().mockReturnValue(reply);
  reply.send = vi.fn().mockReturnValue(reply);
  return reply;
}

describe("blog.router (fastify)", () => {
  it("registers routes with schema options", async () => {
    const blogService = createMockBlogService();
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    expect(fastify.post).toHaveBeenCalledWith("/posts", expect.objectContaining({ schema: expect.any(Object) }), expect.any(Function));
    expect(fastify.put).toHaveBeenCalledWith("/posts/:id/publish", expect.objectContaining({ schema: expect.any(Object) }), expect.any(Function));
    expect(fastify.get).toHaveBeenCalledWith("/posts/:id", expect.objectContaining({ schema: expect.any(Object) }), expect.any(Function));
  });

  it("POST /posts returns 201 on success", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post" }),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("POST", "/posts");
    const reply = createMockReply();
    await handler(
      createMockRequest({ title: "My Post", content: "Hello", authorId: "a-1" }),
      reply,
    );

    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ postId: "p-1", slug: "my-post" });
  });

  it("POST /posts returns 400 on invalid slug", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.fail(InvalidSlug.create("Bad Slug!!!")),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("POST", "/posts");
    const reply = createMockReply();
    await handler(
      createMockRequest({ title: "My Post", slug: "Bad Slug!!!", content: "Hello", authorId: "a-1" }),
      reply,
    );

    expect(reply.code).toHaveBeenCalledWith(400);
  });

  it("GET /posts/:id returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.ok({ postId: "p-1", title: "My Post", slug: "my-post", content: "Hello", authorId: "a-1", status: "draft", createdAt: new Date(), publishedAt: null }),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("GET", "/posts/:id");
    const reply = createMockReply();
    await handler(createMockRequest({}, { id: "p-1" }), reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ postId: "p-1" }));
  });

  it("GET /posts/:id returns 404 when not found", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.fail(PostNotFound.create("missing")),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("GET", "/posts/:id");
    const reply = createMockReply();
    await handler(createMockRequest({}, { id: "missing" }), reply);

    expect(reply.code).toHaveBeenCalledWith(404);
  });

  it("PUT /posts/:id/publish returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.publishPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post", publishedAt: new Date() }),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("PUT", "/posts/:id/publish");
    const reply = createMockReply();
    await handler(createMockRequest({}, { id: "p-1" }), reply);

    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ postId: "p-1" }));
  });

  it("PUT /posts/:id/publish returns 409 when already published", async () => {
    const blogService = createMockBlogService();
    blogService.publishPost.mockResolvedValue(
      Result.fail(PostAlreadyPublished.create("p-1")),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("PUT", "/posts/:id/publish");
    const reply = createMockReply();
    await handler(createMockRequest({}, { id: "p-1" }), reply);

    expect(reply.code).toHaveBeenCalledWith(409);
  });

  it("GET /posts returns 200 with list", async () => {
    const blogService = createMockBlogService();
    blogService.listPosts.mockResolvedValue(
      Result.ok({ posts: [{ postId: "p-1", title: "Post 1" }] }),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any, {});

    const handler = fastify.getHandler("GET", "/posts");
    const reply = createMockReply();
    await handler(createMockRequest(), reply);

    expect(reply.send).toHaveBeenCalledWith({ posts: [{ postId: "p-1", title: "Post 1" }] });
  });
});
