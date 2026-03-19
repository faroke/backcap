---
title: "Example: Hono Blog"
description: A working Hono blog API built step-by-step with the Backcap CLI — identical domain logic to Express and Fastify, different HTTP adapter.
---

This guide walks through a **working Hono blog example** built with the Backcap CLI. It demonstrates that capabilities, adapters, and bridges are truly swappable — the domain and application layers are identical to the [Express example](/backcap/guides/express-blog-example) and [Fastify example](/backcap/guides/fastify-blog-example), only the HTTP adapter and server wiring differ.

The full source code is in [`examples/hono-blog/`](https://github.com/faroke/backcap/tree/main/examples/hono-blog).

## What It Demonstrates

- **Adapter swappability** — Same blog + search capabilities as Express/Fastify, different HTTP layer
- **Edge-ready framework** — Hono's runtime-agnostic design (Node, Bun, Deno, Cloudflare Workers)
- **Context-based API** — Routes use `c.req.json()`, `c.json()` instead of `req`/`res`
- **Blog-Search bridge** — Same event-driven architecture as Express/Fastify examples

## Prerequisites

- Node.js 20+
- pnpm 9+

## Step-by-Step Build

### 1. Create the project

```bash
mkdir examples/hono-blog && cd examples/hono-blog
pnpm init
pnpm add hono @hono/node-server
pnpm add -D typescript tsx @types/node vitest
```

Create `tsconfig.json` and a minimal `src/server.ts` with Hono.

### 2. Initialize Backcap

```bash
npx @backcap/cli init
```

Detects **Hono** framework and pnpm package manager. Creates `backcap.json` with `"framework": "hono"`.

### 3. Install capabilities and bridge

```bash
npx @backcap/cli add blog         # Blog capability + Hono & Prisma adapters
npx @backcap/cli add search       # Search capability
npx @backcap/cli add blog-search  # Bridge: PostPublished → index in search
```

### 4. Set up Prisma

```bash
pnpm add @prisma/client @prisma/adapter-libsql @libsql/client
pnpm add -D prisma dotenv
npx prisma init --datasource-provider sqlite
```

Copy the Post model from `src/adapters/persistence/prisma/blog/blog.schema.prisma` into your `prisma/schema.prisma`, then:

```bash
npx prisma migrate dev --name init
```

### 5. Wire everything in server.ts

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createBlogService } from "./capabilities/blog/contracts/index.js";
import { createSearchService } from "./capabilities/search/contracts/search.factory.js";
import { createBridge } from "./bridges/blog-search/blog-search.bridge.js";
import { createBlogRoutes } from "./adapters/http/hono/blog/blog.router.js";
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";

const app = new Hono();
const eventBus = new InMemoryEventBus();

// Wire capabilities
const blogService = createBlogService({ postRepository, eventBus });
const searchService = createSearchService({ searchEngine });

// Wire bridge
const bridge = createBridge({
  indexDocument: {
    async execute(input) {
      await searchEngine.indexDocument(input.indexName, input.documentId, input.document);
    },
  },
});
bridge.wire(eventBus);

// Register blog routes on a sub-app with /api prefix
const api = new Hono();
createBlogRoutes(blogService, api);
app.route("/api", api);

serve({ fetch: app.fetch, port: 3000 });
```

The key differences from Express/Fastify: routes are registered on a **Hono sub-app** via `app.route()`, and the server uses `@hono/node-server` for the Node runtime.

### 6. Run

```bash
pnpm dev    # Start dev server with tsx watch
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

## Express vs Fastify vs Hono Comparison

| Aspect | Express | Fastify | Hono |
|--------|---------|---------|------|
| **Framework dep** | `express` | `fastify` | `hono` + `@hono/node-server` |
| **Route registration** | `app.use(router)` | `fastify.register(plugin, { prefix })` | `app.route("/api", subApp)` |
| **Response API** | `res.status(201).json(data)` | `reply.code(201).send(data)` | `c.json(data, 201)` |
| **Request body** | `req.body` (middleware) | `request.body` (built-in) | `await c.req.json()` |
| **Route params** | `req.params.id` | `request.params.id` | `c.req.param("id")` |
| **Multi-runtime** | Node only | Node only | Node, Bun, Deno, Workers |
| **Domain/app layers** | Identical | Identical | Identical |

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

See [`examples/hono-blog/FRICTION.md`](https://github.com/faroke/backcap/tree/main/examples/hono-blog/FRICTION.md) for a detailed log of issues encountered during development and fixes applied.

## See Also

- [Express Blog example](/backcap/guides/express-blog-example) — Same capabilities with Express adapter
- [Fastify Blog example](/backcap/guides/fastify-blog-example) — Same capabilities with Fastify adapter
- [Hono adapter](/backcap/adapters/hono) — Adapter API reference
- [Blog capability](/backcap/capabilities/blog) — Full domain model and API reference
- [Bridges concept](/backcap/concepts/bridges) — How bridges connect capabilities
