---
title: NestJS Adapter
description: Wiring guide for integrating Backcap domains with NestJS's decorator-based DI.
---

NestJS uses a **wiring guide** instead of a code adapter. Unlike Express, Fastify, and Hono — where the registry provides framework-agnostic route handlers — NestJS requires compile-time decorators (`@Controller`, `@Get`, `@Inject`) on class definitions that cannot be added programmatically.

## Why No Code Adapter?

All other framework adapters (Express, Fastify, Hono) are framework-agnostic — they define local interface contracts and export plain factory functions. This works because those frameworks accept plain functions for route handlers.

NestJS requires decorators on the class itself. A plain-class controller without `@Controller()`, `@Get()`, `@Post()` is not functional in NestJS. Since the registry adapter pattern is to avoid framework imports, this creates a fundamental incompatibility.

**The solution:** A documented integration pattern using NestJS's `DynamicModule.register()` to bridge Backcap's Pure DI with NestJS's `@Injectable()` DI.

## Integration Pattern

### DynamicModule + useFactory

```typescript
import { Module, DynamicModule } from "@nestjs/common";
import type { IPostRepository } from "../../domains/blog/application/ports/post-repository.port.js";
import { createBlogService } from "../../domains/blog/contracts/index.js";
import { BlogController } from "./blog.controller.js";

interface IEventBus {
  publish<T>(eventName: string, event: T): Promise<void>;
}

export interface BlogModuleDeps {
  postRepository: IPostRepository;
  eventBus?: IEventBus;
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

### Controller with String Token Injection

```typescript
import { Controller, Post, Get, Param, Body, Inject, HttpCode, HttpException } from "@nestjs/common";
import type { IBlogService } from "../../domains/blog/contracts/index.js";
import { InvalidSlug } from "../../domains/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../domains/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../domains/blog/domain/errors/post-already-published.error.js";

function toHttpStatus(error: Error): number {
  if (error instanceof InvalidSlug) return 400;
  if (error instanceof PostNotFound) return 404;
  if (error instanceof PostAlreadyPublished) return 409;
  return 500;
}

@Controller("posts")
export class BlogController {
  constructor(@Inject("IBlogService") private readonly blogService: IBlogService) {}

  @Post()
  @HttpCode(201)
  async createPost(@Body() body: { title: string; slug?: string; content: string; authorId: string }) {
    const result = await this.blogService.createPost(body);
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }
}
```

### Error Responses

| Domain Error | HTTP Status | Response Body |
|---|---|---|
| `InvalidSlug` | `400 Bad Request` | `{ "message": "Invalid slug: ..." }` |
| `PostNotFound` | `404 Not Found` | `{ "message": "Post not found: ..." }` |
| `PostAlreadyPublished` | `409 Conflict` | `{ "message": "Post already published: ..." }` |
| Unexpected | `500 Internal Server Error` | `{ "message": "Internal server error" }` |

## NestJS vs Express vs Fastify vs Hono

| Aspect | Express/Fastify/Hono | NestJS |
|---|---|---|
| **Adapter type** | Code adapter (registry provides route handlers) | Wiring guide (you write decorated controllers) |
| **DI** | Plain function call | `@Inject()` + `useFactory` string token |
| **Error handling** | `res.status(code).json()` | `throw new HttpException()` |
| **Module system** | None | `@Module()` + `DynamicModule.register()` |
| **Extra config** | None | `reflect-metadata`, `emitDecoratorMetadata`, `experimentalDecorators` |

The domain and application layers remain **identical** — only the HTTP adapter and DI wiring differ.

## Writing NestJS Controllers for Other Domains

When integrating a new domain with NestJS:

1. Create a `@Controller` class with `@Inject("IServiceName")` constructor injection
2. Create a `@Module` class with a `static register(deps)` method returning a `DynamicModule`
3. Map domain errors to HTTP status codes in a `toHttpStatus()` helper
4. Use `throw new HttpException()` for error responses
5. Compose at the boundary in `app.module.ts` using `XxxModule.register({ ... })`

## Required Configuration

NestJS requires additional TypeScript and runtime configuration:

```json
// tsconfig.json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

```typescript
// main.ts — entry point
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## Reference Implementation

See the [NestJS Blog example](/backcap/guides/nestjs-blog-example) for a complete working project with blog + search domains, Prisma persistence, and event-driven bridge.
