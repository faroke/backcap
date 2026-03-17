# Blog Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities via the shared event bus.

---

## `blog-search`

**Status**: available

**Source**: blog | **Target**: search

**Events**: `PostPublished`

**Purpose**: Indexes published blog posts in the search engine.

### Install

```bash
npx @backcap/cli add blog-search
```

### Event Shape (duck-typed)

```typescript
interface PostPublishedEvent {
  postId: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  publishedAt: string;
}
```

### Behavior

On `PostPublished`, calls `indexDocument.execute({ indexName: "posts", documentId: event.postId, document: { title, slug, content, authorId, publishedAt } })`.

### Wiring

```typescript
import { createBridge } from './bridges/blog-search/blog-search.bridge.js';

const bridge = createBridge({ indexDocument: searchService.indexDocument });
bridge.wire(eventBus);
```

---

## `blog-comments`

**Status**: available

**Source**: comments | **Target**: blog, notifications

**Events**: `CommentPosted`

**Purpose**: When a comment is posted on a blog post, looks up the post author and sends them a notification.

### Install

```bash
npx @backcap/cli add blog-comments
```

### Event Shape (duck-typed)

```typescript
interface CommentPostedEvent {
  commentId: string;
  resourceType: string;
  resourceId: string;
  authorId: string;
  body: string;
}
```

### Behavior

- Only reacts when `resourceType === "post"`
- Looks up the post via `getPost.execute({ postId: resourceId })`
- If post found, calls `sendNotification.execute({ channel: "email", recipient: post.authorId, subject: "New comment on your post", body: "A new comment was posted: ..." })`
- If post not found (deleted), silently no-ops
- Errors are caught and logged

### Wiring

```typescript
import { createBridge } from './bridges/blog-comments/blog-comments.bridge.js';

const bridge = createBridge({
  getPost: blogService.getPost,
  sendNotification: notificationService.sendNotification,
});
bridge.wire(eventBus);
```

---

## `blog-tags`

**Status**: available

**Source**: blog | **Target**: tags

**Events**: `PostPublished`

**Purpose**: Tags a published post with its associated tags.

### Install

```bash
npx @backcap/cli add blog-tags
```

### Event Shape (duck-typed)

```typescript
interface PostPublishedEvent {
  postId: string;
  tags?: string[];
}
```

### Behavior

- On `PostPublished`, calls `tagResource.execute({ tagSlug, resourceId: event.postId, resourceType: "post" })` for each tag
- If `event.tags` is undefined or empty, the bridge is a no-op
- Errors are caught and logged

### Wiring

```typescript
import { createBridge } from './bridges/blog-tags/blog-tags.bridge.js';

const bridge = createBridge({ tagResource: tagsService.tagResource });
bridge.wire(eventBus);
```

---

## Bridge Conventions

| Rule | Detail |
|---|---|
| Event mirroring | Bridges re-declare the minimal event shape they consume |
| Zero npm deps | No framework imports in bridge logic |
| Factory pattern | `createBridge(deps): Bridge` with `wire(eventBus)` |
| Error isolation | Catch and log, never re-throw |
| Tests co-located | `__tests__/` inside the bridge root |
