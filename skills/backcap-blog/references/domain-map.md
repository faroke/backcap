# Blog Capability — Domain Map

Complete file-by-file reference for the `blog` capability.

---

## Directory Tree

```
capabilities/blog/
  domain/
    entities/
      post.entity.ts
    value-objects/
      slug.vo.ts
    errors/
      invalid-slug.error.ts
      post-not-found.error.ts
      post-already-published.error.ts
    events/
      post-created.event.ts
      post-published.event.ts
    __tests__/
      post.entity.test.ts
      slug.vo.test.ts
      post-events.test.ts
  application/
    use-cases/
      create-post.use-case.ts
      publish-post.use-case.ts
      get-post.use-case.ts
      list-posts.use-case.ts
    ports/
      post-repository.port.ts
    dto/
      create-post.dto.ts
      publish-post.dto.ts
      get-post.dto.ts
      list-posts.dto.ts
    __tests__/
      create-post.use-case.test.ts
      mocks/
        post-repository.mock.ts
      fixtures/
        post.fixture.ts
  contracts/
    blog.contract.ts
    blog.factory.ts
    index.ts
  shared/
    result.ts
```

---

## Domain Layer

### `domain/entities/post.entity.ts`

**Export**: `Post`

The `Post` aggregate root. All fields are `readonly`. The constructor is `private`; use
`Post.create(params)` to construct instances.

```typescript
class Post {
  readonly id: string
  readonly title: string
  readonly slug: Slug           // value object, not raw string
  readonly content: string
  readonly authorId: string
  readonly status: "draft" | "published"
  readonly createdAt: Date
  readonly publishedAt: Date | null

  static create(params: {
    id: string
    title: string
    slug: string          // validated into Slug VO
    content: string
    authorId: string
    status?: "draft" | "published"
    createdAt?: Date
    publishedAt?: Date | null
  }): Result<Post, InvalidSlug>

  publish(): Result<{ post: Post; event: PostPublished }, PostAlreadyPublished>
}
```

`status` defaults to `"draft"` when omitted.

---

### `domain/value-objects/slug.vo.ts`

**Export**: `Slug`

Immutable wrapper for a validated URL slug. Validates format: lowercase alphanumeric
characters separated by hyphens.

```typescript
class Slug {
  readonly value: string
  static create(value: string): Result<Slug, InvalidSlug>
  static fromTitle(title: string): Result<Slug, InvalidSlug>
}
```

`fromTitle` lowercases the title, replaces spaces/special chars with hyphens, and validates.

---

### `domain/errors/invalid-slug.error.ts`

**Export**: `InvalidSlug extends Error`

```typescript
static create(slug: string): InvalidSlug
// message: `Invalid slug: "${slug}"`
```

---

### `domain/errors/post-not-found.error.ts`

**Export**: `PostNotFound extends Error`

```typescript
static create(postId: string): PostNotFound
// message: `Post not found with id: "${postId}"`
```

---

### `domain/errors/post-already-published.error.ts`

**Export**: `PostAlreadyPublished extends Error`

```typescript
static create(postId: string): PostAlreadyPublished
// message: `Post "${postId}" is already published`
```

---

### `domain/events/post-created.event.ts`

**Export**: `PostCreated`

```typescript
class PostCreated {
  readonly postId: string
  readonly authorId: string
  readonly occurredAt: Date
}
```

---

### `domain/events/post-published.event.ts`

**Export**: `PostPublished`

```typescript
class PostPublished {
  readonly postId: string
  readonly title: string
  readonly slug: string
  readonly authorId: string
  readonly publishedAt: Date
}
```

Used by the blog-search bridge to index published posts.

---

## Application Layer

### `application/ports/post-repository.port.ts`

**Export**: `IPostRepository`

```typescript
interface IPostRepository {
  findById(id: string): Promise<Post | null>
  findBySlug(slug: string): Promise<Post | null>
  findAll(filter?: { authorId?: string; status?: "draft" | "published" }): Promise<Post[]>
  save(post: Post): Promise<void>
}
```

---

### `application/use-cases/create-post.use-case.ts`

**Export**: `CreatePost`

Constructor dependencies: `IPostRepository`.

Flow:
1. If `slug` is provided, validate via `Slug.create`. Otherwise, auto-generate via `Slug.fromTitle`.
2. Generate UUID with `crypto.randomUUID()`.
3. Build `Post` via `Post.create` — fail with `InvalidSlug` if slug is invalid.
4. Persist via `IPostRepository.save`.
5. Return `{ output: { postId, slug }, event: PostCreated }`.

---

### `application/use-cases/publish-post.use-case.ts`

**Export**: `PublishPost`

Constructor dependencies: `IPostRepository`.

Flow:
1. Look up post by id — fail with `PostNotFound` if not found.
2. Call `post.publish()` — fail with `PostAlreadyPublished` if already published.
3. Persist updated post.
4. Return `{ output: { postId, slug, publishedAt }, event: PostPublished }`.

---

### `application/use-cases/get-post.use-case.ts`

**Export**: `GetPost`

Constructor dependencies: `IPostRepository`.

Flow:
1. Look up post by id — fail with `PostNotFound` if not found.
2. Return post data as `GetPostOutput`.

---

### `application/use-cases/list-posts.use-case.ts`

**Export**: `ListPosts`

Constructor dependencies: `IPostRepository`.

Flow:
1. Call `IPostRepository.findAll` with optional `authorId` and `status` filters.
2. Map posts to output format and return.

---

## Contracts Layer

### `contracts/blog.contract.ts`

**Exports**: `IBlogService`, DTO type re-exports

```typescript
interface IBlogService {
  createPost(input: CreatePostInput): Promise<Result<CreatePostOutput, Error>>
  publishPost(input: PublishPostInput): Promise<Result<PublishPostOutput, Error>>
  getPost(input: GetPostInput): Promise<Result<GetPostOutput, Error>>
  listPosts(input: ListPostsInput): Promise<Result<ListPostsOutput, Error>>
}
```

---

### `contracts/blog.factory.ts`

**Export**: `createBlogService(deps: BlogServiceDeps): IBlogService`

```typescript
type BlogServiceDeps = {
  postRepository: IPostRepository
}
```

---

## Shared

### `shared/result.ts`

**Export**: `Result<T, E extends Error>`

The `Result` monad. Copied into each capability so the domain and application layers have
zero npm dependencies. Methods: `ok`, `fail`, `isOk`, `isFail`, `unwrap`, `unwrapError`, `map`.
