import { describe, it, expect, vi } from "vitest";
import { createBlogRouteHandlers } from "../blog.route-handlers.js";
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

function createRequest(body: Record<string, unknown> = {}): Request {
  return new Request("http://localhost/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("blog.route-handlers (nextjs)", () => {
  describe("posts handlers", () => {
    it("GET /posts returns 200 with list", async () => {
      const blogService = createMockBlogService();
      blogService.listPosts.mockResolvedValue(
        Result.ok({ posts: [{ postId: "p-1", title: "Post 1" }] }),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const response = await handlers.posts.GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ posts: [{ postId: "p-1", title: "Post 1" }] });
    });

    it("POST /posts returns 201 on success", async () => {
      const blogService = createMockBlogService();
      blogService.createPost.mockResolvedValue(
        Result.ok({ postId: "p-1", slug: "my-post" }),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = createRequest({ title: "My Post", content: "Hello", authorId: "a-1" });
      const response = await handlers.posts.POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual({ postId: "p-1", slug: "my-post" });
    });

    it("POST /posts returns 400 on malformed JSON body", async () => {
      const blogService = createMockBlogService();
      const handlers = createBlogRouteHandlers(blogService);
      const request = new Request("http://localhost/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json",
      });
      const response = await handlers.posts.POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: "Invalid JSON body" });
    });

    it("POST /posts returns 400 on invalid slug", async () => {
      const blogService = createMockBlogService();
      blogService.createPost.mockResolvedValue(
        Result.fail(InvalidSlug.create("Bad Slug!!!")),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = createRequest({ title: "My Post", slug: "Bad Slug!!!", content: "Hello", authorId: "a-1" });
      const response = await handlers.posts.POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("postById handlers", () => {
    it("GET /posts/:id returns 200 on success", async () => {
      const blogService = createMockBlogService();
      blogService.getPost.mockResolvedValue(
        Result.ok({ postId: "p-1", title: "My Post", slug: "my-post", content: "Hello", authorId: "a-1", status: "draft", createdAt: new Date().toISOString(), publishedAt: null }),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = new Request("http://localhost/api/posts/p-1");
      const response = await handlers.postById.GET(request, { params: Promise.resolve({ id: "p-1" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("postId", "p-1");
    });

    it("GET /posts/:id returns 404 when not found", async () => {
      const blogService = createMockBlogService();
      blogService.getPost.mockResolvedValue(
        Result.fail(PostNotFound.create("missing")),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = new Request("http://localhost/api/posts/missing");
      const response = await handlers.postById.GET(request, { params: Promise.resolve({ id: "missing" }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("publish handlers", () => {
    it("PUT /posts/:id/publish returns 200 on success", async () => {
      const blogService = createMockBlogService();
      blogService.publishPost.mockResolvedValue(
        Result.ok({ postId: "p-1", slug: "my-post", publishedAt: new Date().toISOString() }),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = new Request("http://localhost/api/posts/p-1/publish", { method: "PUT" });
      const response = await handlers.publish.PUT(request, { params: Promise.resolve({ id: "p-1" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("postId", "p-1");
    });

    it("PUT /posts/:id/publish returns 409 when already published", async () => {
      const blogService = createMockBlogService();
      blogService.publishPost.mockResolvedValue(
        Result.fail(PostAlreadyPublished.create("p-1")),
      );
      const handlers = createBlogRouteHandlers(blogService);
      const request = new Request("http://localhost/api/posts/p-1/publish", { method: "PUT" });
      const response = await handlers.publish.PUT(request, { params: Promise.resolve({ id: "p-1" }) });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });
  });
});
