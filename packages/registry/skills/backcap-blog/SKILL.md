---
name: backcap-blog
description: >
  Backcap blog capability: DDD-structured blog post management for TypeScript backends.
  Domain layer contains Post entity, Slug value object, and three typed errors
  (InvalidSlug, PostNotFound, PostAlreadyPublished). Application layer has
  CreatePost, PublishPost, GetPost, and ListPosts use cases, plus IPostRepository
  port interface. Public surface is IBlogService and createBlogService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Events: PostCreated and
  PostPublished for bridge wiring. Bridge: blog-search indexes posts on publish.
  Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-blog

The `blog` capability provides **blog post creation, publishing, and listing** for TypeScript
backends. It is structured in strict Clean Architecture layers and has zero npm dependencies
in the domain and application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

See [`references/domain-map.md`](references/domain-map.md) for a full file-by-file reference.

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/post.entity.ts` | `Post` | Aggregate root. Holds `id`, `title`, `slug: Slug`, `content`, `authorId`, `status`, timestamps. Private constructor; factory via `Post.create(params)` returning `Result<Post, InvalidSlug>`. Has `publish()` method returning `Result<{ post: Post; event: PostPublished }, PostAlreadyPublished>`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/slug.vo.ts` | `Slug` | Validates slug format (lowercase, hyphens, no special chars). `Slug.create(value)` returns `Result<Slug, InvalidSlug>`. Can auto-generate from title via `Slug.fromTitle(title)`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/invalid-slug.error.ts` | `InvalidSlug` | `Invalid slug: "<value>"` |
| `domain/errors/post-not-found.error.ts` | `PostNotFound` | `Post not found with id: "<id>"` |
| `domain/errors/post-already-published.error.ts` | `PostAlreadyPublished` | `Post "<id>" is already published` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/post-created.event.ts` | `PostCreated` | `postId`, `authorId`, `occurredAt` |
| `domain/events/post-published.event.ts` | `PostPublished` | `postId`, `title`, `slug`, `authorId`, `publishedAt` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/post-repository.port.ts` | `IPostRepository` | `findById(id)`, `findBySlug(slug)`, `findAll(filter?)`, `save(post)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/create-post.dto.ts` | `CreatePostInput` | `title`, `slug?`, `content`, `authorId` |
| `application/dto/create-post.dto.ts` | `CreatePostOutput` | `postId`, `slug` |
| `application/dto/publish-post.dto.ts` | `PublishPostInput` | `postId` |
| `application/dto/publish-post.dto.ts` | `PublishPostOutput` | `postId`, `slug`, `publishedAt` |
| `application/dto/get-post.dto.ts` | `GetPostInput` | `postId` |
| `application/dto/get-post.dto.ts` | `GetPostOutput` | `postId`, `title`, `slug`, `content`, `authorId`, `status`, `createdAt`, `publishedAt` |
| `application/dto/list-posts.dto.ts` | `ListPostsInput` | `authorId?`, `status?` |
| `application/dto/list-posts.dto.ts` | `ListPostsOutput` | `posts[]` with `postId`, `title`, `slug`, `authorId`, `status`, `createdAt`, `publishedAt` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/create-post.use-case.ts` | `CreatePost` | `Result<{ output: CreatePostOutput; event: PostCreated }, Error>` |
| `application/use-cases/publish-post.use-case.ts` | `PublishPost` | `Result<{ output: PublishPostOutput; event: PostPublished }, Error>` |
| `application/use-cases/get-post.use-case.ts` | `GetPost` | `Result<GetPostOutput, Error>` |
| `application/use-cases/list-posts.use-case.ts` | `ListPosts` | `Result<ListPostsOutput, Error>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/blog.contract.ts` | `IBlogService`, DTO re-exports | The only public interface consumers depend on |
| `contracts/blog.factory.ts` | `createBlogService(deps): IBlogService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

## Extension Guide

See [`references/extension-guide.md`](references/extension-guide.md) for step-by-step
instructions on adding use cases, entities, and DTOs.

### Quick summary

- **New use case**: add to `application/use-cases/`, declare new ports in `application/ports/`
  if needed, wire into `contracts/blog.factory.ts`, expose types from `contracts/index.ts`.
- **New entity / VO**: add to `domain/entities/` or `domain/value-objects/`, private constructor,
  `static create` returning `Result`.
- **New DTO**: add to `application/dto/`, plain `interface`, no methods.

## Conventions

See [`references/patterns.md`](references/patterns.md) for blog-specific patterns.

Blog-specific rules:
- Posts always start as `"draft"` status. The `publish()` method transitions to `"published"`.
- Slugs can be provided explicitly or auto-generated from the title via `Slug.fromTitle()`.
- `PostPublished` event is returned in the `PublishPost` result payload for the caller to
  forward to bridges (e.g. blog-search) or a message bus.
- `PostCreated` event is returned in the `CreatePost` result payload.

## Available Bridges

| Bridge | Description | Install |
|---|---|---|
| `blog-search` | Indexes published posts for full-text search | `backcap add bridge blog-search` |

See [`references/bridges.md`](references/bridges.md) for detailed bridge documentation.

## CLI Commands

| Command | Description |
|---|---|
| `backcap init` | Scaffold `backcap.json` in the current project |
| `backcap list` | List all available capabilities from the registry |
| `backcap add blog` | Install the blog capability (prompts for adapter selection) |
| `backcap bridges` | List bridges compatible with installed capabilities |
| `backcap add bridge blog-search` | Install the blog-search bridge |
