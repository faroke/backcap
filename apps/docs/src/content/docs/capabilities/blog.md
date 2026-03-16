---
title: Blog Capability
description: Blog post management for TypeScript backends — create, publish, and list posts with Clean Architecture.
---

The `blog` capability provides **blog post management** for TypeScript backends. It handles post creation, publishing lifecycle, slug generation, and listing with filtering.

## Install

```bash
npx backcap add blog
```

## Domain Model

### Post Entity

The `Post` entity is the aggregate root. It is immutable — all state changes return new instances.

```typescript
import { Post } from "./capabilities/blog/domain/entities/post.entity";

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
import { Slug } from "./capabilities/blog/domain/value-objects/slug.vo";

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
import { CreatePost } from "./capabilities/blog/application/use-cases/create-post.use-case";

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

No registry adapter is provided — implement this port for your database of choice.

## Public API (contracts/)

```typescript
import { createBlogService, IBlogService } from "./capabilities/blog/contracts";

const blogService: IBlogService = createBlogService({
  postRepository,
});

// IBlogService interface:
// createPost(input): Promise<Result<CreatePostOutput, Error>>
// publishPost(input): Promise<Result<PublishPostOutput, Error>>
// getPost(input): Promise<Result<GetPostOutput, Error>>
// listPosts(input): Promise<Result<ListPostsOutput, Error>>
```

Events are stripped at the service boundary — `IBlogService` returns only output DTOs.

## Bridges

### blog-search

Indexes published posts into the search capability when `PostPublished` fires.

```bash
npx backcap add blog-search
```

**Requires**: `blog` and `search` capabilities installed.

### blog-comments

Notifies post authors when a comment is posted on their post.

### blog-tags

Associates tags with posts when they are published.

## File Map

```
capabilities/blog/
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
