import type { IBlogService } from "../../../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../../../capabilities/blog/domain/errors/post-already-published.error.js";

interface FastifyRequest {
  body: unknown;
  params: Record<string, string>;
}

interface FastifyReply {
  code(statusCode: number): FastifyReply;
  send(payload: unknown): FastifyReply;
}

interface RouteOptions {
  schema?: Record<string, unknown>;
}

type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

interface FastifyInstance {
  get(path: string, handler: RouteHandler): void;
  get(path: string, opts: RouteOptions, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  post(path: string, opts: RouteOptions, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  put(path: string, opts: RouteOptions, handler: RouteHandler): void;
}

const createPostSchema = {
  body: {
    type: "object" as const,
    required: ["title", "content", "authorId"],
    properties: {
      title: { type: "string" as const },
      slug: { type: "string" as const },
      content: { type: "string" as const },
      authorId: { type: "string" as const },
    },
  },
};

const publishPostSchema = {
  params: {
    type: "object" as const,
    required: ["id"],
    properties: {
      id: { type: "string" as const },
    },
  },
};

const getPostSchema = {
  params: {
    type: "object" as const,
    required: ["id"],
    properties: {
      id: { type: "string" as const },
    },
  },
};

function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof InvalidSlug) return { status: 400, message: error.message };
  if (error instanceof PostNotFound) return { status: 404, message: error.message };
  if (error instanceof PostAlreadyPublished) return { status: 409, message: error.message };
  return { status: 500, message: "Internal server error" };
}

export function createBlogPlugin(blogService: IBlogService) {
  return async function blogPlugin(fastify: FastifyInstance, _opts: Record<string, unknown>): Promise<void> {
    fastify.post("/posts", { schema: createPostSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
      const { title, slug, content, authorId } = request.body as {
        title: string;
        slug?: string;
        content: string;
        authorId: string;
      };
      const result = await blogService.createPost({ title, slug, content, authorId });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        reply.code(status).send({ error: message });
        return;
      }

      reply.code(201).send(result.unwrap());
    });

    fastify.put("/posts/:id/publish", { schema: publishPostSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await blogService.publishPost({ postId: request.params.id });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        reply.code(status).send({ error: message });
        return;
      }

      reply.send(result.unwrap());
    });

    fastify.get("/posts/:id", { schema: getPostSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await blogService.getPost({ postId: request.params.id });

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        reply.code(status).send({ error: message });
        return;
      }

      reply.send(result.unwrap());
    });

    fastify.get("/posts", async (_request: FastifyRequest, reply: FastifyReply) => {
      const result = await blogService.listPosts({});

      if (result.isFail()) {
        const { status, message } = toHttpError(result.unwrapError());
        reply.code(status).send({ error: message });
        return;
      }

      reply.send(result.unwrap());
    });
  };
}
