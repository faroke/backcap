# Blog Capability — Patterns Reference

Blog-specific coding patterns, conventions, and design decisions.

---

## Post Lifecycle

Posts follow a strict lifecycle: `draft` → `published`. The transition is handled by the
`Post.publish()` method on the entity, which:

1. Validates the post is not already published.
2. Sets `status` to `"published"` and `publishedAt` to `new Date()`.
3. Returns a new immutable `Post` instance and a `PostPublished` event.

```typescript
// Inside Post entity
publish(): Result<{ post: Post; event: PostPublished }, PostAlreadyPublished> {
  if (this.status === "published") {
    return Result.fail(PostAlreadyPublished.create(this.id));
  }
  const publishedPost = new Post(/* ...with status "published" and publishedAt */);
  const event = new PostPublished(this.id, this.title, this.slug.value, this.authorId, now);
  return Result.ok({ post: publishedPost, event });
}
```

---

## Slug Handling

Slugs can be:

1. **Explicitly provided** — validated via `Slug.create(value)`.
2. **Auto-generated from title** — via `Slug.fromTitle(title)` which lowercases, strips
   special characters, and replaces spaces with hyphens.

The `CreatePost` use case handles both paths:

```typescript
const slugResult = input.slug
  ? Slug.create(input.slug)
  : Slug.fromTitle(input.title);
```

---

## Result Pattern in Blog

All expected failures use `Result<T, E>`. Never throw from use cases for domain errors.

```typescript
// Use case return signatures
async execute(input: CreatePostInput): Promise<Result<{ output; event }, Error>>
async execute(input: PublishPostInput): Promise<Result<{ output; event }, Error>>
async execute(input: GetPostInput): Promise<Result<GetPostOutput, Error>>
async execute(input: ListPostsInput): Promise<Result<ListPostsOutput, Error>>
```

---

## Domain Event Pattern

`CreatePost` and `PublishPost` return events inside the `Result` payload:

```typescript
return Result.ok({ output: { postId, slug }, event: new PostCreated(postId, authorId) });
```

The calling layer decides what to do with the event:

```typescript
// Forward to blog-search bridge
const { output, event } = result.unwrap();
await eventBus.publish("PostPublished", event);

// Or ignore the event
const { output } = result.unwrap();
```

---

## DI Wiring Pattern

The `createBlogService` factory is the **only** place where use cases are instantiated:

```typescript
import { createBlogService } from './domains/blog/contracts/index.js';

const blogService = createBlogService({
  postRepository: new PrismaPostRepository(prisma),
});
```

---

## Mock Pattern for Tests

Test mocks implement port interfaces and use `Map` for storage:

```typescript
export class InMemoryPostRepository implements IPostRepository {
  private store = new Map<string, Post>();

  async findById(id: string): Promise<Post | null> {
    return this.store.get(id) ?? null;
  }
  async findBySlug(slug: string): Promise<Post | null> {
    return [...this.store.values()].find(p => p.slug.value === slug) ?? null;
  }
  async findAll(filter?): Promise<Post[]> { /* filter by authorId/status */ }
  async save(post: Post): Promise<void> { this.store.set(post.id, post); }
}
```

---

## Fixture Pattern

```typescript
export function createTestPost(overrides?: Partial<{
  id: string; title: string; slug: string; content: string;
  authorId: string; status: "draft" | "published";
}>): Post {
  const result = Post.create({
    id: overrides?.id ?? "test-post-1",
    title: overrides?.title ?? "Test Post Title",
    slug: overrides?.slug ?? "test-post-title",
    content: overrides?.content ?? "This is the test post content.",
    authorId: overrides?.authorId ?? "author-1",
    status: overrides?.status ?? "draft",
  });
  return result.unwrap();
}
```
