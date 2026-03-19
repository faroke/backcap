# NestJS Wiring Guide

NestJS uses a decorator-based DI container (`@Injectable()`, `@Inject()`, `@Module()`) that is fundamentally incompatible with the plain-function adapter pattern used for Express, Fastify, and Hono. Instead of a code adapter, this guide documents the integration pattern.

## Why No Code Adapter?

All other framework adapters (Express, Fastify, Hono) are framework-agnostic — they define local interface contracts and export plain factory functions. This works because those frameworks accept plain functions for route handlers.

NestJS requires compile-time decorators on class definitions (`@Controller()`, `@Get()`, `@Post()`, `@Inject()`). These cannot be added programmatically or after the fact. A plain-class controller without decorators is not functional in NestJS.

## Integration Pattern: DynamicModule + useFactory

Bridge Backcap's Pure DI with NestJS's decorator-based DI using `DynamicModule.register()`:

### 1. Controller — Decorated class delegating to Backcap service

```typescript
import { Controller, Post, Get, Put, Body, Param, Inject, HttpCode, HttpException } from "@nestjs/common";
import type { IBlogService } from "../../capabilities/blog/contracts/index.js";
import { InvalidSlug } from "../../capabilities/blog/domain/errors/invalid-slug.error.js";
import { PostNotFound } from "../../capabilities/blog/domain/errors/post-not-found.error.js";
import { PostAlreadyPublished } from "../../capabilities/blog/domain/errors/post-already-published.error.js";

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

  @Get(":id")
  async getPost(@Param("id") id: string) {
    const result = await this.blogService.getPost({ postId: id });
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }

  // ... other routes follow the same pattern
}
```

### 2. Module — DynamicModule wrapping Backcap factory

```typescript
import { Module, DynamicModule } from "@nestjs/common";
import type { IPostRepository } from "../../capabilities/blog/application/ports/post-repository.port.js";
import { createBlogService } from "../../capabilities/blog/contracts/index.js";
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

### 3. App Module — Compose at the boundary

```typescript
import { Module } from "@nestjs/common";

// Infrastructure created outside NestJS DI (Backcap's Pure DI)
const prisma = new PrismaClient();
const postRepository = new PrismaPostRepository(prisma);
const eventBus = new InMemoryEventBus();

@Module({
  imports: [
    BlogModule.register({ postRepository, eventBus }),
  ],
})
export class AppModule {}
```

## Key Points

- **String token injection**: Use `@Inject("IBlogService")` with a string token, not a class reference. NestJS's `useFactory` provider calls Backcap's factory, and the result is injected via the string token.
- **Infrastructure lives outside DI**: Repositories, event buses, and bridges are created at module scope and passed into `register()`. Backcap handles composition; NestJS handles HTTP routing.
- **Error handling**: Use `throw new HttpException()` instead of manual response formatting. Map domain errors to HTTP status codes.
- **Decorator config required**: NestJS needs `reflect-metadata`, `emitDecoratorMetadata: true`, and `experimentalDecorators: true` in tsconfig.json.

## Reference Implementation

See `examples/nestjs-blog/` for a complete working example with blog + search capabilities, Prisma persistence, and event-driven bridge.
