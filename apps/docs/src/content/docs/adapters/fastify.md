---
title: Fastify Adapter
description: Fastify plugin implementations for Backcap capabilities.
---

The Fastify adapter package provides HTTP route handlers as [Fastify plugins](https://fastify.dev/docs/latest/Reference/Plugins/) for Backcap capability service interfaces. Each adapter wires a capability's public `IService` interface to Fastify routes using the plugin pattern.

## Install

Install the Fastify adapter for a specific capability:

```bash
npx @backcap/cli add blog-fastify
```

## blog-fastify

### What Gets Written

```
src/adapters/http/fastify/blog/
  blog.router.ts          # createBlogPlugin() — Fastify plugin for blog CRUD
```

### createBlogPlugin

Creates a Fastify plugin factory that registers blog routes.

```typescript
import Fastify from "fastify";
import { createBlogPlugin } from "./adapters/http/fastify/blog/blog.router";
import { blogService } from "./container";

const fastify = Fastify({ logger: true });

// Register blog routes under /api prefix
await fastify.register(
  async (instance) => {
    await createBlogPlugin(blogService)(instance);
  },
  { prefix: "/api" },
);
```

**Routes:**

| Method | Path | Request Body | Success Response | Description |
|---|---|---|---|---|
| `POST` | `/posts` | `{ title, slug?, content, authorId }` | `201 { postId, slug }` | Create a blog post |
| `PUT` | `/posts/:id/publish` | — | `200 { postId, slug, publishedAt }` | Publish a draft post |
| `GET` | `/posts/:id` | — | `200 { postId, title, slug, content, ... }` | Get a single post |
| `GET` | `/posts` | — | `200 { posts: [...] }` | List all posts |

**Error responses:**

| Domain Error | HTTP Status | Response Body |
|---|---|---|
| `InvalidSlug` | `400 Bad Request` | `{ "error": "Invalid slug: ..." }` |
| `PostNotFound` | `404 Not Found` | `{ "error": "Post not found: ..." }` |
| `PostAlreadyPublished` | `409 Conflict` | `{ "error": "Post already published: ..." }` |
| Unexpected | `500 Internal Server Error` | `{ "error": "Internal server error" }` |

### Function Signature

```typescript
export function createBlogPlugin(blogService: IBlogService): (fastify: FastifyInstance) => Promise<void>
```

The function accepts an `IBlogService` instance and returns an async Fastify plugin function. This design allows you to:

- Mount the routes at any prefix using `fastify.register(plugin, { prefix: "/api" })`
- Encapsulate routes within Fastify's plugin system
- Test the routes in isolation by passing a mock `IBlogService`

### Fastify vs Express

| Aspect | Express | Fastify |
|---|---|---|
| **Export** | `createBlogRouter(service, router): Router` | `createBlogPlugin(service): Plugin` |
| **Registration** | `app.use("/api", router)` | `fastify.register(plugin, { prefix: "/api" })` |
| **Response API** | `res.status(201).json(data)` | `reply.code(201).send(data)` |
| **Plugin pattern** | Middleware chain | Encapsulated plugin system |

The domain and application layers remain **identical** — only the HTTP adapter differs.

## Writing Additional Fastify Adapters

When a new capability needs a Fastify HTTP layer:

1. Create the file at `adapters/fastify/<capability>/<name>.router.ts`
2. Import the public service interface from `capabilities/<capability>/contracts`
3. Import domain error classes from `capabilities/<capability>/domain/errors/`
4. Write a `createXxxPlugin(service: IService)` function that returns an async Fastify plugin
5. Map domain errors to HTTP status codes using a `toHttpError()` helper
6. Write route handler tests using a mock service

## Testing

The Fastify adapter tests use a mock `IBlogService` to test the HTTP layer in isolation:

```typescript
describe("Fastify blog adapter", () => {
  it("POST /posts returns 201 on success", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post" }),
    );
    const fastify = createMockFastify();
    await createBlogPlugin(blogService)(fastify as any);

    const handler = fastify.getHandler("POST", "/posts");
    const reply = createMockReply();
    await handler({ body: { title: "My Post", content: "Hello", authorId: "a-1" }, params: {} }, reply);

    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({ postId: "p-1", slug: "my-post" });
  });
});
```

## Dependencies

The Fastify adapter uses duck-typed interfaces for `FastifyInstance`, `FastifyRequest`, and `FastifyReply` rather than importing directly from the `fastify` package. This means the adapter file itself has no `fastify` npm dependency.

You will need `fastify` in your project:

```bash
pnpm add fastify
```
