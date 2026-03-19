import type { IBlogService } from "../../../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../../../capabilities/blog/domain/errors/post-already-published.error.js";

interface HonoRequest {
  json(): Promise<unknown>;
  param(key: string): string;
}

interface HonoContext {
  req: HonoRequest;
  json(data: unknown, status?: number): Response;
}

type HonoHandler = (c: HonoContext) => Promise<Response>;

interface HonoApp {
  get(path: string, handler: HonoHandler): void;
  post(path: string, handler: HonoHandler): void;
  put(path: string, handler: HonoHandler): void;
}

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidSlug) return { status: 400, message: error.message };
  if (error instanceof PostNotFound) return { status: 404, message: error.message };
  if (error instanceof PostAlreadyPublished) return { status: 409, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createBlogRoutes(blogService: IBlogService, app: HonoApp): HonoApp {
  app.post("/posts", async (c: HonoContext) => {
    const { title, slug, content, authorId } = (await c.req.json()) as {
      title: string;
      slug?: string;
      content: string;
      authorId: string;
    };
    const result = await blogService.createPost({ title, slug, content, authorId });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      return c.json({ error: message }, status);
    }

    return c.json(result.unwrap(), 201);
  });

  app.put("/posts/:id/publish", async (c: HonoContext) => {
    const result = await blogService.publishPost({ postId: c.req.param("id") });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      return c.json({ error: message }, status);
    }

    return c.json(result.unwrap());
  });

  app.get("/posts/:id", async (c: HonoContext) => {
    const result = await blogService.getPost({ postId: c.req.param("id") });

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      return c.json({ error: message }, status);
    }

    return c.json(result.unwrap());
  });

  app.get("/posts", async (c: HonoContext) => {
    const result = await blogService.listPosts({});

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      return c.json({ error: message }, status);
    }

    return c.json(result.unwrap());
  });

  return app;
}
