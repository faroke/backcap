---
title: "Example: NestJS Blog"
description: A working NestJS blog API built step-by-step with the Backcap CLI — identical domain logic to Express, Fastify, and Hono, with a DynamicModule DI bridge pattern.
---

This guide walks through a **working NestJS blog example** built with the Backcap CLI. It demonstrates that domains, adapters, and bridges are truly swappable — the domain and application layers are identical to the [Express example](/backcap/guides/express-blog-example), [Fastify example](/backcap/guides/fastify-blog-example), and [Hono example](/backcap/guides/hono-blog-example). Only the HTTP adapter and DI wiring differ.

NestJS is the **highest-friction framework** integration due to its decorator-based DI system. This example documents the bridge pattern that makes it work.

The full source code is in [`examples/nestjs-blog/`](https://github.com/faroke/backcap/tree/main/examples/nestjs-blog).

## What It Demonstrates

- **DI bridge pattern** — Bridges Backcap's Pure DI with NestJS's `@Injectable()` decorator-based DI
- **DynamicModule.register()** — NestJS modules wrapping Backcap factory functions
- **String token injection** — `@Inject("IBlogService")` with `useFactory` providers
- **Blog-Search bridge** — Same event-driven architecture as Express/Fastify/Hono examples

## Prerequisites

- Node.js 20+
- pnpm 9+

## Step-by-Step Build

### 1. Create the project

```bash
mkdir examples/nestjs-blog && cd examples/nestjs-blog
pnpm init
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
pnpm add -D typescript @types/node vitest
```

Create `tsconfig.json` with `emitDecoratorMetadata: true` and `experimentalDecorators: true` — required by NestJS.

### 2. Initialize Backcap

```bash
npx @backcap/cli init
```

Detects **NestJS** framework and pnpm package manager. Creates `backcap.json` with `"framework": "nestjs"`.

### 3. Install domains and bridge

```bash
npx @backcap/cli add blog         # Blog domain + Prisma adapter
npx @backcap/cli add search       # Search domain
npx @backcap/cli add blog-search  # Bridge: PostPublished → index in search
```

> **Note:** NestJS HTTP adapters are not provided as code adapters (see [NestJS adapter docs](/backcap/adapters/nestjs) for why). You'll create the NestJS controllers and modules manually using the `DynamicModule.register()` pattern.

### 4. Set up Prisma

```bash
pnpm add @prisma/client
pnpm add -D prisma
npx prisma init --datasource-provider sqlite
```

Copy the Post model from `src/adapters/persistence/prisma/blog/blog.schema.prisma` into your `prisma/schema.prisma`, then:

```bash
npx prisma migrate dev --name init
```

### 5. Create NestJS modules with DynamicModule pattern

This is the key integration pattern — bridging Backcap's Pure DI with NestJS's decorator-based DI:

```typescript
// src/adapters/http/nestjs/blog/blog.module.ts
import { Module, DynamicModule } from "@nestjs/common";
import type { IPostRepository } from "../../../../domains/blog/application/ports/post-repository.port.js";
import { createBlogService } from "../../../../domains/blog/contracts/index.js";
import { BlogController } from "./blog.controller.js";

export interface BlogModuleDeps {
  postRepository: IPostRepository;
  eventBus?: { publish<T>(eventName: string, event: T): Promise<void> };
}

@Module({})
export class BlogModule {
  static register(deps: BlogModuleDeps): DynamicModule {
    return {
      module: BlogModule,
      controllers: [BlogController],
      providers: [
        {
          provide: "IBlogService",
          useFactory: () => createBlogService(deps),
        },
      ],
    };
  }
}
```

NestJS's `useFactory` calls Backcap's factory, and the result is injected via a string token. The controller receives it via `@Inject("IBlogService")`.

### 6. Wire everything in app.module.ts

```typescript
import { Module } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPostRepository } from "./adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";
import { BlogModule } from "./adapters/http/nestjs/blog/blog.module.js";
import { SearchModule } from "./adapters/http/nestjs/search/search.module.js";

// Infrastructure created outside NestJS DI (Backcap's Pure DI)
const prisma = new PrismaClient();
const postRepository = new PrismaPostRepository(prisma);
const eventBus = new InMemoryEventBus();
const searchEngine = new InMemorySearchEngine();

// Wire bridge
const bridge = new BlogSearchBridge(searchEngine);
bridge.wire(eventBus);

@Module({
  imports: [
    BlogModule.register({ postRepository, eventBus }),
    SearchModule.register({ searchEngine }),
  ],
})
export class AppModule {}
```

Infrastructure (Prisma, event bus, repositories) is created at module scope and passed into NestJS via `register()`. Backcap handles composition; NestJS handles HTTP routing.

### 7. Run

```bash
pnpm dev    # Start dev server
pnpm test   # Run vitest
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/posts` | Create a blog post |
| `GET` | `/posts` | List all posts |
| `GET` | `/posts/:id` | Get a single post |
| `PUT` | `/posts/:id/publish` | Publish a draft post |
| `GET` | `/search?q=...` | Search published posts |

## Express vs Fastify vs Hono vs NestJS Comparison

| Aspect | Express | Fastify | Hono | NestJS |
|--------|---------|---------|------|--------|
| **DI** | Plain function call | Plain function call | Plain function call | `@Inject()` + `useFactory` provider |
| **Routes** | `router.get()` | `fastify.get()` | `app.get()` | `@Get()` decorator on method |
| **Error handling** | `res.status(400).json()` | `reply.code(400).send()` | `c.json(error, 400)` | `throw new HttpException()` |
| **Module system** | None (just imports) | Plugin system | None (just imports) | `@Module()` + `DynamicModule` |
| **Extra config** | None | None | None | `reflect-metadata`, `emitDecoratorMetadata` |
| **Domain/app layers** | Identical | Identical | Identical | Identical |

## Architecture Flow

```
POST /posts/:id/publish
  → blogService.publishPost()
    → PublishPost use case
    → eventBus.publish("PostPublished", enrichedEvent)
      → blog-search bridge
        → searchEngine.indexDocument("posts", postId, document)

GET /search?q=hello
  → searchService.searchDocuments()
    → searchEngine.search("posts", "hello")
    → returns indexed post data
```

## Friction Points

NestJS is the highest-friction framework integration. The key friction points are:

1. **DI system clash** — Pure DI vs `@Injectable()`, bridged via `DynamicModule` + `useFactory`
2. **Decorator requirement** — Extra dependencies (`reflect-metadata`) and tsconfig options
3. **Exception-based error handling** — `throw new HttpException()` instead of manual response formatting

See [`examples/nestjs-blog/FRICTION.md`](https://github.com/faroke/backcap/tree/main/examples/nestjs-blog/FRICTION.md) for the full 8-point friction log.

## See Also

- [Express Blog example](/backcap/guides/express-blog-example) — Same domains with Express adapter
- [Fastify Blog example](/backcap/guides/fastify-blog-example) — Same domains with Fastify adapter
- [Hono Blog example](/backcap/guides/hono-blog-example) — Same domains with Hono adapter
- [NestJS adapter](/backcap/adapters/nestjs) — Why NestJS uses a wiring guide instead of a code adapter
- [Blog domain](/backcap/domains/blog) — Full domain model and API reference
- [Bridges concept](/backcap/concepts/bridges) — How bridges connect domains
