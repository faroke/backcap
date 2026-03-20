---
title: Comments Capability
description: Threaded comments and moderation — post, list, and soft-delete comments on any resource for TypeScript backends.
---

The `comments` capability provides **threaded commenting on any resource** with soft-delete and author-based moderation for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add comments
```

## Domain Model

### Comment Entity

The `Comment` entity is the aggregate root. It attaches to any resource via generic `resourceId`/`resourceType` strings and supports threaded replies via `parentId`.

```typescript
import { Comment } from "./capabilities/comments/domain/entities/comment.entity";

const result = Comment.create({
  id: crypto.randomUUID(),
  content: "Great article!",
  authorId: "user-1",
  resourceId: "post-123",
  resourceType: "post",
  parentId: undefined, // root comment
});

if (result.isOk()) {
  const comment = result.unwrap();
  const deleted = comment.softDelete().unwrap();
  console.log(deleted.deletedAt); // Date
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `content` | `CommentContent` | Validated content value object (1–10,000 chars) |
| `authorId` | `string` | Comment author identifier |
| `resourceId` | `string` | Generic resource identifier |
| `resourceType` | `string` | Generic resource type (e.g., "post", "product") |
| `parentId` | `string \| undefined` | Parent comment for threading |
| `createdAt` | `Date` | Timestamp of creation |
| `deletedAt` | `Date \| undefined` | Soft-delete timestamp |

**State transitions:**
- `softDelete()` — sets `deletedAt` to current date. Fails if already deleted.

### CommentContent Value Object

```typescript
import { CommentContent } from "./capabilities/comments/domain/value-objects/comment-content.vo";

const result = CommentContent.create("Great article!");
// Result<CommentContent, Error>
```

Validates: content must be between 1 and 10,000 characters after trimming.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `CommentNotFound` | No comment found for the given ID | `Comment not found with id: "<id>"` |
| `UnauthorizedDelete` | Requester is not the comment author | `User "<requesterId>" is not authorized to delete comment "<id>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `CommentPosted` | `PostComment` use case | `commentId`, `authorId`, `resourceId`, `resourceType`, `occurredAt` |

## Application Layer

### Use Cases

#### PostComment

Creates a new comment on a resource. When `parentId` is provided for threading, the parent comment must exist or the operation fails with `CommentNotFound`.

```typescript
const result = await commentsService.postComment({
  content: "Great article!",
  authorId: "user-1",
  resourceId: "post-123",
  resourceType: "post",
  parentId: "comment-456", // optional for threading — parent must exist
});
// Result<{ commentId: string; createdAt: Date }, Error>
```

#### ListComments

Lists comments for a resource with pagination. Excludes deleted comments by default.

```typescript
const result = await commentsService.listComments({
  resourceId: "post-123",
  resourceType: "post",
  includeDeleted: false, // default
  limit: 50,
  offset: 0,
});
// Result<{ comments: Array<...>; total: number }, Error>
```

#### DeleteComment

Soft-deletes a comment. Verifies that `requesterId === comment.authorId`.

```typescript
const result = await commentsService.deleteComment({
  commentId: "comment-123",
  requesterId: "user-1",
});
// Result<{ deletedAt: Date }, Error>
```

### Port Interfaces

#### ICommentRepository

```typescript
export interface ICommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: string): Promise<Comment | undefined>;
  findByResource(resourceId: string, resourceType: string, filters: CommentFilters): Promise<{ comments: Comment[]; total: number }>;
}
```

## Public API (contracts/)

```typescript
import { createCommentsService, ICommentsService } from "./capabilities/comments/contracts";

const commentsService: ICommentsService = createCommentsService({ commentRepository });
```

## Adapters

### comments-prisma

Provides `PrismaCommentRepository` which implements `ICommentRepository`.

```bash
npx @backcap/cli add comments-prisma
```

### comments-express

Provides `createCommentsRouter(service, router)` for HTTP access.

```bash
npx @backcap/cli add comments-express
```

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/comments` | `{ content, authorId, resourceId, resourceType, parentId? }` | `201 { commentId, createdAt }` |
| `GET` | `/comments` | `?resourceId=&resourceType=&includeDeleted=&limit=&offset=` | `200 { comments, total }` |
| `DELETE` | `/comments/:id` | `{ requesterId }` | `200 { deletedAt }` |

## Bridges

- **blog-comments** — triggers `SendNotification` when `CommentPosted` fires on a blog post

## File Map

```
capabilities/comments/
  domain/
    entities/comment.entity.ts
    value-objects/comment-content.vo.ts
    events/comment-posted.event.ts
    errors/comment-not-found.error.ts
    errors/unauthorized-delete.error.ts
  application/
    use-cases/post-comment.use-case.ts
    use-cases/list-comments.use-case.ts
    use-cases/delete-comment.use-case.ts
    ports/comment-repository.port.ts
    dto/post-comment.dto.ts
    dto/list-comments.dto.ts
    dto/delete-comment.dto.ts
  contracts/
    comments.contract.ts
    comments.factory.ts
    index.ts
  shared/
    result.ts
```
