---
title: "Example: Fastify Blog"
description: A working Fastify blog API built step-by-step with the Backcap CLI — identical domain logic to Express, different HTTP adapter.
---

This guide walks through a **working Fastify blog example** built with the Backcap CLI. It demonstrates that domains, adapters, and bridges are truly swappable — the domain and application layers are identical to the [Express example](/backcap/guides/express-blog-example), only the HTTP adapter and server wiring differ.

The full source code is in [`examples/fastify-blog/`](https://github.com/faroke/backcap/tree/main/examples/fastify-blog).

## What It Demonstrates

- **Adapter swappability** — Same blog + search domains as Express, different HTTP layer
- **Fastify plugin pattern** — Routes registered via `fastify.register()` instead of Express routers
- **Schema validation** — Fastify JSON Schema validation on routes
- **Blog-Search bridge** — Same event-driven architecture as Express example

## Prerequisites

- Node.js 20+
- pnpm 9+

## Step-by-Step Build

### 1. Create the project

```bash
mkdir examples/fastify-blog && cd examples/fastify-blog
pnpm init
pnpm add fastify
pnpm add -D typescript tsx @types/node vitest
```

Create `tsconfig.json` and a minimal `src/server.ts` with Fastify.

### 2. Initialize Backcap

```bash
npx @backcap/cli init
```

Detects **Fastify** framework and pnpm package manager. Creates `backcap.json` with `"framework": "fastify"`.

### 3. Install domains and bridge

```bash
npx @backcap/cli add blog         # Blog domain + Fastify & Prisma adapters
npx @backcap/cli add search       # Search domain
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
import Fastify from "fastify";
import { createBlogService } from "./domains/blog/contracts/index.js";
import { createSearchService } from "./domains/search/contracts/search.factory.js";
import { createBridge } from "./bridges/blog-search/blog-search.bridge.js";
import { createBlogPlugin } from "./adapters/http/fastify/blog/blog.router.js";
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";

const fastify = Fastify({ logger: true });
const eventBus = new InMemoryEventBus();

// Wire domains
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

// Register blog routes as Fastify plugin
await fastify.register(
  async (instance) => {
    await createBlogPlugin(blogService)(instance);
  },
  { prefix: "/api" },
);
```

The key difference from Express: routes are registered as a **Fastify plugin** via `fastify.register()`, not mounted as an Express router.

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

## Express vs Fastify Comparison

| Aspect | Express | Fastify |
|--------|---------|---------|
| **Framework dep** | `express` | `fastify` |
| **Route registration** | `app.use(router)` | `fastify.register(plugin, { prefix })` |
| **Response API** | `res.status(201).json(data)` | `reply.code(201).send(data)` |
| **Body parsing** | `express.json()` middleware | Built-in |
| **Schema validation** | Manual or middleware | Native JSON Schema |
| **Domain/app layers** | Identical | Identical |

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

See [`examples/fastify-blog/FRICTION.md`](https://github.com/faroke/backcap/tree/main/examples/fastify-blog/FRICTION.md) for a detailed log of issues encountered during development and fixes applied.

## See Also

- [Express Blog example](/backcap/guides/express-blog-example) — Same domains with Express adapter
- [Hono Blog example](/backcap/guides/hono-blog-example) — Same domains with Hono adapter
- [NestJS Blog example](/backcap/guides/nestjs-blog-example) — Same domains with NestJS DI bridge
- [Fastify adapter](/backcap/adapters/fastify) — Adapter API reference
- [Blog domain](/backcap/domains/blog) — Full domain model and API reference
- [Bridges concept](/backcap/concepts/bridges) — How bridges connect domains
