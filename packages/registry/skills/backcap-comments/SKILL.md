---
name: backcap-comments
description: Comments capability for Backcap — post, list, and soft-delete comments on any resource
metadata:
  author: backcap
  version: 0.1.0
---

# Comments Capability

## Domain Map

```
capabilities/comments/
├── domain/
│   ├── entities/comment.entity.ts             # Comment — aggregate with softDelete()
│   ├── value-objects/comment-content.vo.ts    # CommentContent — validated 1-10000 chars
│   ├── events/comment-posted.event.ts         # CommentPosted — emitted when posted
│   └── errors/
│       ├── comment-not-found.error.ts         # CommentNotFound
│       └── unauthorized-delete.error.ts       # UnauthorizedDelete
├── application/
│   ├── use-cases/
│   │   ├── post-comment.use-case.ts           # PostComment — create a new comment (validates parentId exists)
│   │   ├── list-comments.use-case.ts          # ListComments — paginate by resource
│   │   └── delete-comment.use-case.ts         # DeleteComment — soft delete with auth check
│   ├── dto/                                   # Input/Output interfaces per use case
│   └── ports/comment-repository.port.ts       # ICommentRepository — persistence contract
├── contracts/
│   ├── comments.contract.ts                   # ICommentsService
│   ├── comments.factory.ts                    # createCommentsService(deps)
│   └── index.ts                               # Barrel exports
└── shared/result.ts                           # Result<T, E> type
```

## Extension Guide

### Adding Threaded Comments Display

The domain supports threads via `parentId`. To display threaded comments:

1. `ListComments` returns flat results — arrange into a tree in your presentation layer
2. Group comments by `parentId` (undefined = root)
3. Recursively render children under their parent
4. The domain remains flat — threading is a UI concern

## Conventions

- All domain code is pure TypeScript — zero framework imports
- `resourceId` + `resourceType` are generic strings (attach to any entity)
- `softDelete()` sets `deletedAt` — does not remove the record
- `DeleteComment` verifies `requesterId === comment.authorId`
- `ListComments` excludes deleted by default (`includeDeleted: false`)
- Result<T, E> for all fallible operations

## Available Adapters

- **Prisma**: `adapters/prisma/comments/prisma-comment-repository.ts` — implements ICommentRepository
- **Express**: `adapters/express/comments/comments.router.ts` — REST endpoints (POST, GET, DELETE)

## CLI Commands

```bash
backcap add comments       # Install the capability
backcap bridges            # List available bridges
```
