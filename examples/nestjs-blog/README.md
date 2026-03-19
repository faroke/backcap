# NestJS Blog Example

A working blog API built with [Backcap](https://github.com/faroke/backcap) — demonstrating how Backcap's clean architecture integrates with NestJS's opinionated, decorator-based framework.

## What's Inside

- **Blog capability** — CRUD operations for blog posts (create, publish, get, list)
- **Search capability** — Document indexing and full-text search
- **Blog-Search bridge** — Automatically indexes posts in search when published
- **Prisma adapter** — SQLite persistence via Prisma ORM
- **NestJS adapter** — HTTP routes via NestJS controllers with `@Inject()` DI bridge

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Set up the database
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name init

# Start the development server
pnpm dev
```

The server starts at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/posts` | Create a blog post |
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get a single post |
| `PUT` | `/api/posts/:id/publish` | Publish a draft post |
| `GET` | `/api/search?q=...` | Search published posts |

## Usage

```bash
# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello Backcap", "content": "My first post!", "authorId": "user-1"}'

# List posts
curl http://localhost:3000/api/posts

# Publish (replace POST_ID with actual ID)
curl -X PUT http://localhost:3000/api/posts/POST_ID/publish

# Search (works after publishing)
curl "http://localhost:3000/api/search?q=backcap"
```

## How It Was Built

This example was built step-by-step using the Backcap CLI:

```bash
# 1. Initialize Backcap config (detects NestJS framework)
npx @backcap/cli init -y

# 2. Install blog capability + adapters
npx @backcap/cli add blog -y
# → blog-prisma adapter installed, blog-nestjs skipped (not yet published)

# 3. Install search capability
npx @backcap/cli add search -y
# → search adapters skipped (not yet published)

# 4. Install blog-search bridge
npx @backcap/cli add blog-search -y
# → bridge installed, but shared/ files missing — manually created

# 5. Manually create NestJS HTTP adapter (blog-nestjs not yet published)
# 6. Create in-memory search engine (search-prisma not yet published)
# 7. Create shared/ files (event-bus, bridge interface)
# 8. Wire everything via NestJS DynamicModule pattern
# 9. Set up Prisma schema, generate client, run migrations
```

## Backcap inside NestJS — Integration Pattern

NestJS has its own DI container (`@Injectable()`, `@Inject()`). Backcap uses Pure DI (manual constructor injection via factories). The bridge pattern uses NestJS's `DynamicModule`:

```typescript
// blog.module.ts — bridges Backcap's Pure DI with NestJS's @Injectable DI
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

```typescript
// blog.controller.ts — NestJS controller delegating to Backcap service
@Controller("posts")
export class BlogController {
  constructor(@Inject("IBlogService") private readonly blogService: IBlogService) {}

  @Post()
  @HttpCode(201)
  async createPost(@Body() body: CreatePostInput) {
    const result = await this.blogService.createPost(body);
    if (result.isFail()) {
      const error = result.unwrapError();
      throw new HttpException(error.message, toHttpStatus(error));
    }
    return result.unwrap();
  }
}
```

```typescript
// app.module.ts — compose at the boundary, hand to NestJS
const postRepository = new PrismaPostRepository(prisma);
const eventBus = new InMemoryEventBus();

@Module({
  imports: [
    BlogModule.register({ postRepository, eventBus }),
    SearchModule.register({ searchService }),
  ],
})
export class AppModule {}
```

Key insight: NestJS's `useFactory` provider calls Backcap's factory function, and the resulting service is injected via string token (`"IBlogService"`).

## NestJS vs Express vs Fastify vs Hono

| Aspect | Express/Fastify/Hono | NestJS |
|--------|---------------------|--------|
| DI | Plain function call | `@Inject()` + `useFactory` provider |
| Routes | `router.get()` / `app.get()` | `@Get()` decorator on method |
| Error handling | `res.status(400).json()` | `throw new HttpException()` |
| Module system | None (just imports) | `@Module()` with `DynamicModule` |
| Config extras | None | `reflect-metadata`, `emitDecoratorMetadata` |

## Running Tests

```bash
pnpm test
```

## Project Structure

```
examples/nestjs-blog/
├── src/
│   ├── main.ts                                  # Application entry point (NestJS bootstrap)
│   ├── app.module.ts                            # Root module (infrastructure wiring)
│   ├── capabilities/
│   │   ├── blog/                                # Blog capability (installed by CLI)
│   │   │   ├── domain/                          # Entities, value objects, events
│   │   │   ├── application/                     # Use cases, DTOs, ports
│   │   │   └── contracts/                       # Service interface & factory
│   │   └── search/                              # Search capability (installed by CLI)
│   ├── adapters/
│   │   ├── http/nestjs/blog/                    # NestJS blog controller + module
│   │   ├── http/nestjs/search/                  # NestJS search controller + module
│   │   ├── persistence/prisma/blog/             # Prisma repository (installed by CLI)
│   │   └── in-memory-search-engine.ts           # In-memory search for demo
│   ├── bridges/
│   │   └── blog-search/                         # Blog→Search bridge (installed by CLI)
│   ├── shared/                                  # Event bus, Result type, Bridge interface
│   └── __tests__/                               # Tests
├── prisma/
│   └── schema.prisma                            # Database schema
├── backcap.json                                 # Backcap configuration
├── FRICTION.md                                  # Friction points encountered & fixes
└── package.json
```

## Friction Points

See [FRICTION.md](./FRICTION.md) for a detailed log of every issue encountered during development and the fixes applied.
