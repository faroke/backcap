import { describe, it, expect, vi } from "vitest";
import { createBlogRouter } from "../blog.router.js";
import { Result } from "../../../../capabilities/blog/shared/result.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";

function createMockBlogService() {
  return {
    createPost: vi.fn(),
    publishPost: vi.fn(),
    getPost: vi.fn(),
    listPosts: vi.fn(),
  };
}

function createMockRouter() {
  const handlers = new Map<string, Function>();
  return {
    post: vi.fn((path: string, handler: Function) => handlers.set(`POST ${path}`, handler)),
    put: vi.fn((path: string, handler: Function) => handlers.set(`PUT ${path}`, handler)),
    get: vi.fn((path: string, handler: Function) => handlers.set(`GET ${path}`, handler)),
    getHandler: (method: string, path: string) => handlers.get(`${method} ${path}`)!,
  };
}

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("blog.router", () => {
  it("POST /posts returns 201 on success", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post" }),
    );
    const router = createMockRouter();
    createBlogRouter(blogService, router as any);

    const handler = router.getHandler("POST", "/posts");
    const res = createMockRes();
    await handler(
      { body: { title: "My Post", content: "Hello", authorId: "a-1" }, params: {} },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ postId: "p-1", slug: "my-post" });
  });

  it("POST /posts returns 400 on invalid slug", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.fail(InvalidSlug.create("Bad Slug!!!")),
    );
    const router = createMockRouter();
    createBlogRouter(blogService, router as any);

    const handler = router.getHandler("POST", "/posts");
    const res = createMockRes();
    await handler(
      { body: { title: "My Post", slug: "Bad Slug!!!", content: "Hello", authorId: "a-1" }, params: {} },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("GET /posts/:id returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.ok({ postId: "p-1", title: "My Post", slug: "my-post", content: "Hello", authorId: "a-1", status: "draft", createdAt: new Date(), publishedAt: null }),
    );
    const router = createMockRouter();
    createBlogRouter(blogService, router as any);

    const handler = router.getHandler("GET", "/posts/:id");
    const res = createMockRes();
    await handler({ body: {}, params: { id: "p-1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("GET /posts/:id returns 404 when not found", async () => {
    const blogService = createMockBlogService();
    blogService.getPost.mockResolvedValue(
      Result.fail(PostNotFound.create("missing")),
    );
    const router = createMockRouter();
    createBlogRouter(blogService, router as any);

    const handler = router.getHandler("GET", "/posts/:id");
    const res = createMockRes();
    await handler({ body: {}, params: { id: "missing" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("PUT /posts/:id/publish returns 200 on success", async () => {
    const blogService = createMockBlogService();
    blogService.publishPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post", publishedAt: new Date() }),
    );
    const router = createMockRouter();
    createBlogRouter(blogService, router as any);

    const handler = router.getHandler("PUT", "/posts/:id/publish");
    const res = createMockRes();
    await handler({ body: {}, params: { id: "p-1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
