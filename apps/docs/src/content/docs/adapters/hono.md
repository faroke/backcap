---
title: Hono Adapter
description: Hono route implementations for Backcap domains.
---

The Hono adapter package provides HTTP route handlers for Backcap domain service interfaces using [Hono](https://hono.dev/)'s lightweight, edge-ready API. Each adapter wires a domain's public `IService` interface to Hono routes using the Context pattern.

## Install

Install the Hono adapter for a specific domain:

```bash
npx @backcap/cli add blog-hono
```

## blog-hono

### What Gets Written

```
src/adapters/http/hono/blog/
  blog.router.ts          # createBlogRoutes() — Hono routes for blog CRUD
```

### createBlogRoutes

Registers blog routes on a Hono app instance.

```typescript
import { Hono } from "hono";
import { createBlogRoutes } from "./adapters/http/hono/blog/blog.router";
import { blogService } from "./container";

const app = new Hono();

// Register blog routes on a sub-app with /api prefix
const api = new Hono();
createBlogRoutes(blogService, api);
app.route("/api", api);
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
export function createBlogRoutes(blogService: IBlogService, app: HonoApp): HonoApp
```

The function accepts an `IBlogService` instance and a Hono-like app, registering routes directly on it. This design allows you to:

- Mount the routes at any prefix using `app.route("/api", subApp)`
- Test the routes in isolation by passing a mock `IBlogService` and mock app
- Use the adapter on any Hono-compatible runtime (Node, Bun, Deno, Cloudflare Workers)

### Hono vs Express vs Fastify

| Aspect | Express | Fastify | Hono |
|---|---|---|---|
| **Export** | `createBlogRouter(service, router)` | `createBlogPlugin(service)` | `createBlogRoutes(service, app)` |
| **Registration** | `app.use("/api", router)` | `fastify.register(plugin, { prefix })` | `app.route("/api", subApp)` |
| **Response API** | `res.status(201).json(data)` | `reply.code(201).send(data)` | `c.json(data, 201)` |
| **Request API** | `req.body`, `req.params.id` | `request.body`, `request.params.id` | `c.req.json()`, `c.req.param("id")` |
| **Pattern** | Middleware chain | Plugin system | Context-based |

The domain and application layers remain **identical** — only the HTTP adapter differs.

## Multi-Runtime Support

Hono is designed for multiple JavaScript runtimes. The adapter itself uses no runtime-specific APIs:

| Runtime | Server Setup | Package |
|---|---|---|
| Node.js | `serve({ fetch: app.fetch })` | `@hono/node-server` |
| Bun | `Bun.serve({ fetch: app.fetch })` | Built-in |
| Deno | `Deno.serve(app.fetch)` | Built-in |
| Cloudflare Workers | `export default app` | Built-in |

## Writing Additional Hono Adapters

When a new domain needs a Hono HTTP layer:

1. Create the file at `adapters/hono/<domain>/<name>.router.ts`
2. Import the public service interface from `domains/<domain>/contracts`
3. Import domain error classes from `domains/<domain>/domain/errors/`
4. Write a `createXxxRoutes(service: IService, app: HonoApp)` function
5. Map domain errors to HTTP status codes using a `toHttpError()` helper
6. Write route handler tests using a mock service

## Testing

The Hono adapter tests use a mock `IBlogService` to test the HTTP layer in isolation:

```typescript
describe("Hono blog adapter", () => {
  it("POST /posts returns 201 on success", async () => {
    const blogService = createMockBlogService();
    blogService.createPost.mockResolvedValue(
      Result.ok({ postId: "p-1", slug: "my-post" }),
    );
    const app = createMockHono();
    createBlogRoutes(blogService, app as any);

    const handler = app.getHandler("POST", "/posts");
    const c = createMockContext({ title: "My Post", content: "Hello", authorId: "a-1" });
    await handler(c);

    expect(c.json).toHaveBeenCalledWith({ postId: "p-1", slug: "my-post" }, 201);
  });
});
```

## Dependencies

The Hono adapter uses duck-typed interfaces for `HonoApp`, `HonoContext`, and `HonoRequest` rather than importing directly from the `hono` package. This means the adapter file itself has no `hono` npm dependency.

You will need `hono` in your project:

```bash
pnpm add hono
```

For Node.js runtime, also add:

```bash
pnpm add @hono/node-server
```
