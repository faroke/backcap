---
title: "Example: Express Blog"
description: A working Express blog API built step-by-step with the Backcap CLI — blog, search, and bridge integration.
---

This guide walks through a **working Express blog example** built entirely with the Backcap CLI. It demonstrates domains, adapters, bridges, and event-driven architecture in a real project.

The full source code is in [`examples/express-blog/`](https://github.com/faroke/backcap/tree/main/examples/express-blog).

## What It Demonstrates

- **Blog domain** — CRUD operations for blog posts
- **Search domain** — Document indexing and full-text search
- **Blog-Search bridge** — Automatically indexes posts when published
- **Prisma adapter** — SQLite persistence
- **Event bus** — Domain events flowing from blog to search via bridge

## Prerequisites

- Node.js 20+
- pnpm 9+

## Step-by-Step Build

### 1. Create the project

```bash
mkdir examples/express-blog && cd examples/express-blog
pnpm init
pnpm add express
pnpm add -D typescript tsx @types/express @types/node vitest
```

Create `tsconfig.json` and a minimal `src/server.ts` with Express.

### 2. Initialize Backcap

```bash
npx @backcap/cli init
```

Detects Express framework and pnpm package manager. Creates `backcap.json`.

### 3. Install domains and bridge

```bash
npx @backcap/cli add blog       # Blog domain + Express & Prisma adapters
npx @backcap/cli add search     # Search domain
npx @backcap/cli add blog-search # Bridge: PostPublished → index in search
```

### 4. Set up Prisma

```bash
pnpm add @prisma/client @prisma/adapter-libsql
pnpm add -D prisma dotenv
npx prisma init --datasource-provider sqlite
```

Copy the Post model from `src/adapters/persistence/prisma/blog/blog.schema.prisma` into your `prisma/schema.prisma`, then:

```bash
npx prisma migrate dev --name init
```

### 5. Wire everything in server.ts

```typescript
import { createBlogService } from "./domains/blog/contracts/index.js";
import { createSearchService } from "./domains/search/contracts/search.factory.js";
import { createBridge } from "./bridges/blog-search/blog-search.bridge.js";
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";

// Wire domains with event bus
const eventBus = new InMemoryEventBus();
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
```

The `eventBus` is optional — when passed to `createBlogService`, domain events (`PostCreated`, `PostPublished`) are published automatically, enabling bridges to react.

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

## See Also

- [Fastify Blog example](/backcap/guides/fastify-blog-example) — Same domains with Fastify adapter
- [Hono Blog example](/backcap/guides/hono-blog-example) — Same domains with Hono adapter
- [NestJS Blog example](/backcap/guides/nestjs-blog-example) — Same domains with NestJS DI bridge
- [Blog domain](/backcap/domains/blog) — Full domain model and API reference
- [Search domain](/backcap/domains/search) — Search engine port and use cases
- [Bridges concept](/backcap/concepts/bridges) — How bridges connect domains
