import { describe, it, expect, vi } from "vitest";
import { createBlogRoutes } from "../blog.router.js";
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

function createMockHono() {
  const routes = new Map<string, Function>();

  return {
    post: vi.fn((path: string, handler: Function) => routes.set(`POST ${path}`, handler)),
    put: vi.fn((path: string, handler: Function) => routes.set(`PUT ${path}`, handler)),
    get: vi.fn((path: string, handler: Function) => routes.set(`GET ${path}`, handler)),
    getHandler: (method: string, path: string) => routes.get(`${method} ${path}`)!,
  };
}

function createMockContext(body: Record<string, unknown> = {}, params: Record<string, string> = {}) {
  return {
    req: {
      json: vi.fn().mockResolvedValue(body),
      param: vi.fn((key: string) => params[key]),
    },
    json: vi.fn((data: unknown, status?: number) => {
      return new Response(JSON.stringify(data), { status: status ?? 200 });
    }),
  };
}

describe("blog.router (hono)", () => {
  it("registers all blog routes", async () => {
    const blogService = createMockBlogService();
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    expect(app.post).toHaveBeenCalledWith("/posts", expect.any(Function));
    expect(app.put).toHaveBeenCalledWith("/posts/:id/publish", expect.any(Function));
    expect(app.get).toHaveBeenCalledWith("/posts/:id", expect.any(Function));
    expect(app.get).toHaveBeenCalledWith("/posts", expect.any(Function));
  });

  it("POST /posts returns 201 on success", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post" }),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("POST", "/posts");
    const c = createMockContext({ title: "My Post", content: "Hello", authorId: "a-1" });
    const response = await handler(c);

    expect(c.json).toHaveBeenCalledWith({ postId: "p-1", slug: "my-post" }, 201);
  });

  it("POST /posts returns 400 on invalid slug", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.fail(InvalidSlug.create("Bad Slug!!!")),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("POST", "/posts");
    const c = createMockContext({ title: "My Post", slug: "Bad Slug!!!", content: "Hello", authorId: "a-1" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith({ error: expect.any(String) }, 400);
  });

  it("GET /posts/:id returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.ok({ postId: "p-1", title: "My Post", slug: "my-post", content: "Hello", authorId: "a-1", status: "draft", createdAt: new Date(), publishedAt: null }),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("GET", "/posts/:id");
    const c = createMockContext({}, { id: "p-1" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith(expect.objectContaining({ postId: "p-1" }));
  });

  it("GET /posts/:id returns 404 when not found", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.fail(PostNotFound.create("missing")),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("GET", "/posts/:id");
    const c = createMockContext({}, { id: "missing" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith({ error: expect.any(String) }, 404);
  });

  it("PUT /posts/:id/publish returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.publishPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post", publishedAt: new Date() }),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("PUT", "/posts/:id/publish");
    const c = createMockContext({}, { id: "p-1" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith(expect.objectContaining({ postId: "p-1" }));
  });

  it("PUT /posts/:id/publish returns 409 when already published", async () => {
    const blogService = createMockBlogService();
    blogService.publishPost.mockResolvedValue(
      Result.fail(PostAlreadyPublished.create("p-1")),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("PUT", "/posts/:id/publish");
    const c = createMockContext({}, { id: "p-1" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith({ error: expect.any(String) }, 409);
  });

  it("GET /posts returns 200 with list", async () => {
    const blogService = createMockBlogService();
    blogService.listPosts.mockResolvedValue(
      Result.ok({ posts: [{ postId: "p-1", title: "Post 1" }] }),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("GET", "/posts");
    const c = createMockContext();
    await handler(c);

    expect(c.json).toHaveBeenCalledWith({ posts: [{ postId: "p-1", title: "Post 1" }] });
  });
});
