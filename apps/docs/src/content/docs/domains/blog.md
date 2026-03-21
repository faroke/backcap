---
title: Blog Domain
description: Blog post management for TypeScript backends — create, publish, and list posts with Clean Architecture.
---

The `blog` domain provides **blog post management** for TypeScript backends. It handles post creation, publishing lifecycle, slug generation, and listing with filtering.

## Install

```bash
npx @backcap/cli add blog
```

## Domain Model

### Post Entity

The `Post` entity is the aggregate root. It is immutable — all state changes return new instances.

```typescript
import { Post } from "./domains/blog/domain/entities/post.entity";

const result = Post.create({
  id: crypto.randomUUID(),
  title: "Getting Started with Backcap",
  content: "Blog post content here...",
  authorId: "user-123",
});

if (result.isOk()) {
  const post = result.unwrap();
  console.log(post.slug.value); // "getting-started-with-backcap"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `title` | `string` | Post title |
| `slug` | `Slug` | URL-safe kebab-case identifier (value object) |
| `content` | `string` | Post body content |
| `authorId` | `string` | Reference to the author's user ID |
| `status` | `"draft" \| "published"` | Lifecycle state, defaults to `"draft"` |
| `createdAt` | `Date` | Creation timestamp |
| `publishedAt` | `Date \| null` | Set when the post is published |

`Post.create()` returns `Result<Post, InvalidSlug>`. If no slug is provided, one is auto-generated from the title via `Slug.fromTitle()`.

#### Publishing a Post

```typescript
const publishResult = post.publish();
if (publishResult.isOk()) {
  const { post: published, event } = publishResult.unwrap();
  console.log(published.status); // "published"
  console.log(event); // PostPublished { postId, slug, publishedAt }
}
```

Returns `Result<{ post: Post; event: PostPublished }, PostAlreadyPublished>`. Fails if the post is already published.

### Slug Value Object

```typescript
import { Slug } from "./domains/blog/domain/value-objects/slug.vo";

const result = Slug.create("my-blog-post");
// Result<Slug, InvalidSlug>

const fromTitle = Slug.fromTitle("Hello World! My Post");
// Result<Slug, InvalidSlug> — produces "hello-world-my-post"
```

Validates against `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` — lowercase alphanumeric segments joined by single hyphens.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `InvalidSlug` | Slug fails format validation | `Invalid slug: "<value>". Slug must be lowercase kebab-case.` |
| `PostNotFound` | No post found for the given ID | `Post not found with id: "<id>"` |
| `PostAlreadyPublished` | Attempt to publish an already-published post | `Post with id "<id>" is already published.` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `PostCreated` | `CreatePost` use case | `postId`, `authorId`, `occurredAt` |
| `PostPublished` | `Post.publish()` method | `postId`, `slug`, `publishedAt`, `occurredAt` |

## Application Layer

### Use Cases

#### CreatePost

Creates a draft post with an auto-generated or explicit slug.

```typescript
import { CreatePost } from "./domains/blog/application/use-cases/create-post.use-case";

const createPost = new CreatePost(postRepository);

const result = await createPost.execute({
  title: "My First Post",
  content: "Hello world!",
  authorId: "user-123",
  slug: "my-first-post", // optional
});
// Result<{ output: { postId, slug }; event: PostCreated }, Error>
```

#### PublishPost

Transitions a draft post to published state.

```typescript
const result = await publishPost.execute({ postId: "post-123" });
// Result<{ output: { postId, slug, publishedAt }; event: PostPublished }, Error>
```

**Possible failures**: `PostNotFound`, `PostAlreadyPublished`

#### GetPost

Retrieves a post by ID with full details.

```typescript
const result = await getPost.execute({ postId: "post-123" });
// Result<GetPostOutput, Error>
```

#### ListPosts

Returns paginated posts with optional filters.

```typescript
const result = await listPosts.execute({
  authorId: "user-123",  // optional
  status: "published",   // optional
});
// Result<{ posts: ListPostsOutputItem[] }, Error>
```

### Port Interface

#### IPostRepository

```typescript
export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]>;
  save(post: Post): Promise<void>;
}
```

## Adapters

### blog-prisma

Provides `PrismaPostRepository` which implements `IPostRepository`.

```bash
npx @backcap/cli add blog-prisma
```

```typescript
import { PrismaPostRepository } from "./adapters/prisma/blog/post-repository.adapter";

const postRepository = new PrismaPostRepository(prisma);
```

### blog-express

Provides `createBlogRouter(service, router)` for HTTP access.

```bash
npx @backcap/cli add blog-express
```

```typescript
import { createBlogRouter } from "./adapters/express/blog/blog.router";

const router = express.Router();
createBlogRouter(blogService, router);
app.use(router);
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/posts` | `{ title, content, authorId, slug? }` | `201 { postId, slug }` or error |
| `PUT` | `/posts/:id/publish` | — | `200 { postId, slug, publishedAt }` or error |
| `GET` | `/posts/:id` | — | `200 { id, title, ... }` or `404` |
| `GET` | `/posts` | — | `200 { posts }` |

## Public API (contracts/)

```typescript
import { createBlogService, IBlogService } from "./domains/blog/contracts";

const blogService: IBlogService = createBlogService({
  postRepository,
  eventBus, // optional — when provided, PostCreated and PostPublished events are published automatically
});

// IBlogService interface:
// createPost(input): Promise<Result<CreatePostOutput, Error>>
// publishPost(input): Promise<Result<PublishPostOutput, Error>>
// getPost(input): Promise<Result<GetPostOutput, Error>>
// listPosts(input): Promise<Result<ListPostsOutput, Error>>
```

The `eventBus` dependency is optional. When provided, the factory automatically publishes `PostCreated` and `PostPublished` domain events after successful operations. This enables bridges (like `blog-search`) to react to blog events without manual wiring.

## Bridges

### blog-search

Indexes published posts into the search domain when `PostPublished` fires.

```bash
npx @backcap/cli add blog-search
```

**Requires**: `blog` and `search` domains installed.

### blog-comments

Notifies post authors when a comment is posted on their post.

### blog-tags

Associates tags with posts when they are published.

## File Map

```
domains/blog/
  domain/
    entities/post.entity.ts
    value-objects/slug.vo.ts
    events/post-created.event.ts
    events/post-published.event.ts
    errors/invalid-slug.error.ts
    errors/post-not-found.error.ts
    errors/post-already-published.error.ts
  application/
    use-cases/create-post.use-case.ts
    use-cases/publish-post.use-case.ts
    use-cases/get-post.use-case.ts
    use-cases/list-posts.use-case.ts
    ports/post-repository.port.ts
    dto/create-post.dto.ts
    dto/publish-post.dto.ts
    dto/get-post.dto.ts
    dto/list-posts.dto.ts
  contracts/
    blog.contract.ts
    blog.factory.ts
    index.ts
  shared/
    result.ts
```
