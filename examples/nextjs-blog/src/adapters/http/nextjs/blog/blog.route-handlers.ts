import type { IBlogService } from "../../../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../../../capabilities/blog/domain/errors/post-already-published.error.js";

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidSlug) return { status: 400, message: error.message };
  if (error instanceof PostNotFound) return { status: 404, message: error.message };
  if (error instanceof PostAlreadyPublished) return { status: 409, message: error.message };
  return { status: 500, message: "Internal server error" };
}

interface RouteContext<T extends Record<string, string> = Record<string, string>> {
  params: Promise<T>;
}

export function createBlogRouteHandlers(blogService: IBlogService) {
  return {
    posts: {
      GET: async (): Promise<Response> => {
        const result = await blogService.listPosts({});

        if (result.isFail()) {
          const { status, message } = toHttpError(result.unwrapError());
          return Response.json({ error: message }, { status });
        }

        return Response.json(result.unwrap());
      },

      POST: async (request: Request): Promise<Response> => {
        let body: { title: string; slug?: string; content: string; authorId: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const { title, slug, content, authorId } = body;
        const result = await blogService.createPost({ title, slug, content, authorId });

        if (result.isFail()) {
          const { status, message } = toHttpError(result.unwrapError());
          return Response.json({ error: message }, { status });
        }

        return Response.json(result.unwrap(), { status: 201 });
      },
    },

    postById: {
      GET: async (request: Request, context: RouteContext<{ id: string }>): Promise<Response> => {
        const { id } = await context.params;
        const result = await blogService.getPost({ postId: id });

        if (result.isFail()) {
          const { status, message } = toHttpError(result.unwrapError());
          return Response.json({ error: message }, { status });
        }

        return Response.json(result.unwrap());
      },
    },

    publish: {
      PUT: async (request: Request, context: RouteContext<{ id: string }>): Promise<Response> => {
        const { id } = await context.params;
        const result = await blogService.publishPost({ postId: id });

        if (result.isFail()) {
          const { status, message } = toHttpError(result.unwrapError());
          return Response.json({ error: message }, { status });
        }

        return Response.json(result.unwrap());
      },
    },
  };
}
