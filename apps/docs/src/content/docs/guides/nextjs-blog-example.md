---
title: "Example: Next.js Blog"
description: A working Next.js App Router blog API built step-by-step with the Backcap CLI — identical domain logic to Express, Fastify, and Hono, different HTTP adapter suited for serverless.
---

This guide walks through a **working Next.js blog example** built with the Backcap CLI. It demonstrates that domains, adapters, and bridges are truly swappable — the domain and application layers are identical to the [Express example](/backcap/guides/express-blog-example), [Fastify example](/backcap/guides/fastify-blog-example), and [Hono example](/backcap/guides/hono-blog-example), only the HTTP adapter and server wiring differ.

The full source code is in [`examples/nextjs-blog/`](https://github.com/faroke/backcap/tree/main/examples/nextjs-blog).

## What It Demonstrates

- **Adapter swappability** — Same blog + search domains as other frameworks, different HTTP layer
- **Serverless-ready** — Next.js App Router API routes with module-level singleton pattern
- **File-based routing** — Routes use `app/api/` convention with handler delegation
- **Blog-Search bridge** — Same event-driven architecture as other examples

## Prerequisites

- Node.js 20+
- pnpm 9+

## Step-by-Step Build

### 1. Create the project

```bash
mkdir examples/nextjs-blog && cd examples/nextjs-blog
npx create-next-app@latest . --typescript --app --eslint --no-tailwind --no-src-dir --no-import-alias
```

Or manually:

```bash
pnpm init
pnpm add next react react-dom
pnpm add -D typescript @types/node @types/react @types/react-dom vitest
```

Create `tsconfig.json` with `@/*` path alias pointing to `./src/*`.

### 2. Configure ESM extension resolution

Backcap domains use `.js` extensions in imports. Add webpack config to `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
```

### 3. Initialize Backcap

```bash
npx @backcap/cli init
```

Detects **Next.js** framework and pnpm package manager. Creates `backcap.json` with `"framework": "nextjs"`.

### 4. Install domains and bridge

```bash
npx @backcap/cli add blog         # Blog domain + Next.js & Prisma adapters
npx @backcap/cli add search       # Search domain
npx @backcap/cli add blog-search  # Bridge: PostPublished → index in search
```

### 5. Set up Prisma

```bash
pnpm add @prisma/client @prisma/adapter-libsql @libsql/client
pnpm add -D prisma
npx prisma init --datasource-provider sqlite
```

Copy the Post model from `src/adapters/persistence/prisma/blog/blog.schema.prisma` into your `prisma/schema.prisma`, then:

```bash
npx prisma migrate dev --name init
```

### 6. Wire services with serverless-safe singleton

```typescript
// src/lib/services.ts
import { createBlogService } from "../domains/blog/contracts/index.js";
import { createSearchService } from "../domains/search/contracts/search.factory.js";
import { createBridge } from "../bridges/blog-search/blog-search.bridge.js";
import { createBlogRouteHandlers } from "../adapters/http/nextjs/blog/blog.route-handlers.js";
import { InMemoryEventBus } from "../shared/in-memory-event-bus.js";

const globalForServices = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  blogHandlers: ReturnType<typeof createBlogRouteHandlers> | undefined;
  searchService: ReturnType<typeof createSearchService> | undefined;
};

function bootstrapServices() {
  const eventBus = new InMemoryEventBus();
  const postRepository = new PrismaPostRepository(prisma);
  const searchEngine = new InMemorySearchEngine();

  const blogService = createBlogService({ postRepository, eventBus });
  const searchService = createSearchService({ searchEngine });

  const bridge = createBridge({ /* ... */ });
  bridge.wire(eventBus);

  const blogHandlers = createBlogRouteHandlers(blogService);
  return { blogHandlers, searchService };
}
```

The key difference from Express/Hono: services are created via a **module-level singleton** with `globalThis` caching for dev hot-reload, instead of once at server startup.

### 7. Create API route files

```typescript
// app/api/posts/route.ts
import { getServices } from "@/lib/services";

export async function GET() {
  const { blogHandlers } = getServices();
  return blogHandlers.posts.GET();
}

export async function POST(request: Request) {
  const { blogHandlers } = getServices();
  return blogHandlers.posts.POST(request);
}
```

```typescript
// app/api/posts/[id]/route.ts
import { getServices } from "@/lib/services";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { blogHandlers } = getServices();
  return blogHandlers.postById.GET(request, context);
}
```

### 8. Run

```bash
pnpm dev    # Start Next.js dev server
pnpm test   # Run vitest
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/posts` | Create a blog post |
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get a single post |
| `PUT` | `/api/posts/:id/publish` | Publish a draft post |
| `GET` | `/api/search?q=...` | Search published posts |

## Express vs Hono vs NestJS vs Next.js Comparison

| Aspect | Express | Hono | NestJS | Next.js |
|--------|---------|------|--------|---------|
| **Framework dep** | `express` | `hono` + `@hono/node-server` | `@nestjs/core` + `reflect-metadata` | `next` + `react` |
| **Route registration** | `app.use(router)` | `app.route("/api", subApp)` | `@Controller()` decorators | File-based (`app/api/`) |
| **Response API** | `res.status(201).json(data)` | `c.json(data, 201)` | `return data` | `Response.json(data, { status: 201 })` |
| **Request body** | `req.body` (middleware) | `await c.req.json()` | `@Body()` decorator | `await request.json()` |
| **Execution model** | Long-running server | Long-running server | Long-running server | Serverless (per-request) |
| **Domain/app layers** | Identical | Identical | Identical | Identical |

## Architecture Flow

```
POST /api/posts/:id/publish
  → blogService.publishPost()
    → PublishPost use case
    → eventBus.publish("PostPublished", enrichedEvent)
      → blog-search bridge
        → searchEngine.indexDocument("posts", postId, document)

GET /api/search?q=hello
  → searchService.searchDocuments()
    → searchEngine.search("posts", "hello")
    → returns indexed post data
```

## Friction Points

See [`examples/nextjs-blog/FRICTION.md`](https://github.com/faroke/backcap/tree/main/examples/nextjs-blog/FRICTION.md) for a detailed log of issues encountered during development and fixes applied.

## See Also

- [Express Blog example](/backcap/guides/express-blog-example) — Same domains with Express adapter
- [Fastify Blog example](/backcap/guides/fastify-blog-example) — Same domains with Fastify adapter
- [Hono Blog example](/backcap/guides/hono-blog-example) — Same domains with Hono adapter
- [NestJS Blog example](/backcap/guides/nestjs-blog-example) — Same domains with NestJS DI bridge
- [Next.js adapter](/backcap/adapters/nextjs) — Adapter API reference
- [Blog domain](/backcap/domains/blog) — Full domain model and API reference
- [Bridges concept](/backcap/concepts/bridges) — How bridges connect domains
