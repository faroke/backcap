---
title: Next.js Adapter
description: Next.js App Router route handler implementations for Backcap domains.
---

The Next.js adapter provides HTTP route handlers for Backcap domain service interfaces using [Next.js](https://nextjs.org/) App Router API routes. Each adapter wires a domain's public `IService` interface to handler objects that Next.js route files delegate to.

## Install

Install the Next.js adapter for a specific domain:

```bash
npx @backcap/cli add blog-nextjs
```

## blog-nextjs

### What Gets Written

```
src/adapters/http/nextjs/blog/
  blog.route-handlers.ts   # createBlogRouteHandlers() — handler objects for blog CRUD
```

### createBlogRouteHandlers

Returns a handler object that Next.js route files delegate to.

```typescript
import { createBlogRouteHandlers } from "./adapters/http/nextjs/blog/blog.route-handlers";
import { blogService } from "./container";

const handlers = createBlogRouteHandlers(blogService);

// In app/api/posts/route.ts:
export async function GET() {
  return handlers.posts.GET();
}
export async function POST(request: Request) {
  return handlers.posts.POST(request);
}
```

**Routes:**

| Method | Route File | Request Body | Success Response | Description |
|---|---|---|---|---|
| `POST` | `app/api/posts/route.ts` | `{ title, slug?, content, authorId }` | `201 { postId, slug }` | Create a blog post |
| `GET` | `app/api/posts/route.ts` | — | `200 { posts: [...] }` | List all posts |
| `GET` | `app/api/posts/[id]/route.ts` | — | `200 { postId, title, slug, content, ... }` | Get a single post |
| `PUT` | `app/api/posts/[id]/publish/route.ts` | — | `200 { postId, slug, publishedAt }` | Publish a draft post |

**Error responses:**

| Domain Error | HTTP Status | Response Body |
|---|---|---|
| `InvalidSlug` | `400 Bad Request` | `{ "error": "Invalid slug: ..." }` |
| Invalid JSON body | `400 Bad Request` | `{ "error": "Invalid JSON body" }` |
| `PostNotFound` | `404 Not Found` | `{ "error": "Post not found: ..." }` |
| `PostAlreadyPublished` | `409 Conflict` | `{ "error": "Post already published: ..." }` |
| Unexpected | `500 Internal Server Error` | `{ "error": "Internal server error" }` |

### Function Signature

```typescript
export function createBlogRouteHandlers(blogService: IBlogService)
```

The function accepts an `IBlogService` instance and returns a handler object with `posts`, `postById`, and `publish` groups. Each group contains HTTP method handlers (`GET`, `POST`, `PUT`) that return `Response` objects.

### Why Handler Objects?

Unlike Express, Fastify, and Hono — where the adapter registers routes on a router — Next.js uses **file-based routing**. Each route file (`app/api/.../route.ts`) exports named functions (`GET`, `POST`, `PUT`). The adapter cannot "register routes" programmatically, so it returns handler objects that route files delegate to.

```
app/api/posts/route.ts          → handlers.posts.GET / POST
app/api/posts/[id]/route.ts     → handlers.postById.GET
app/api/posts/[id]/publish/route.ts → handlers.publish.PUT
```

## Next.js vs Express vs Hono vs NestJS

| Aspect | Express | Hono | NestJS | Next.js |
|---|---|---|---|---|
| **Export** | `createBlogRouter(service, router)` | `createBlogRoutes(service, app)` | Wiring guide | `createBlogRouteHandlers(service)` |
| **Registration** | `app.use("/api", router)` | `app.route("/api", subApp)` | `XxxModule.register()` | File-based (`app/api/`) |
| **Response API** | `res.status(201).json(data)` | `c.json(data, 201)` | `return data` | `Response.json(data, { status: 201 })` |
| **Request API** | `req.body`, `req.params.id` | `c.req.json()`, `c.req.param("id")` | `@Body()`, `@Param()` | `request.json()`, `context.params` |
| **Pattern** | Middleware chain | Context-based | Decorators + DI | Handler delegation |

The domain and application layers remain **identical** — only the HTTP adapter differs.

## Serverless Considerations

Next.js API routes run in a **serverless context**. Key considerations:

- **No persistent server state** — use a module-level singleton pattern for service factory
- **Prisma client** — use the `globalThis` singleton pattern to avoid connection exhaustion in dev hot-reload
- **Cold starts** — Backcap's Pure DI factory is lightweight, negligible cold start overhead

```typescript
// src/lib/services.ts — serverless-safe singleton
const globalForServices = globalThis as unknown as { services: Services };

function getServices() {
  if (globalForServices.services) return globalForServices.services;
  const services = bootstrapServices();
  if (process.env.NODE_ENV !== "production") {
    globalForServices.services = services;
  }
  return services;
}
```

## ESM Extension Alias

Backcap domains use `.js` extensions in imports (ESM convention). Next.js webpack bundler requires an `extensionAlias` config to resolve `.js` → `.ts`:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};
```

## Writing Additional Next.js Adapters

When a new domain needs a Next.js HTTP layer:

1. Create the file at `adapters/nextjs/<domain>/<name>.route-handlers.ts`
2. Import the public service interface from `domains/<domain>/contracts`
3. Import domain error classes from `domains/<domain>/domain/errors/`
4. Write a `createXxxRouteHandlers(service: IService)` function returning handler objects
5. Map domain errors to HTTP status codes using a `toHttpError()` helper
6. Write route handler tests using a mock service

## Testing

The Next.js adapter tests use a mock `IBlogService` to test the HTTP layer in isolation:

```typescript
describe("Next.js blog adapter", () => {
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
});
```

## Dependencies

The Next.js adapter uses the Web Standard `Response` API (available in Next.js runtime) and duck-typed interfaces for route context. The adapter file itself has no `next` npm dependency.

You will need `next` in your project:

```bash
pnpm add next react react-dom
```
