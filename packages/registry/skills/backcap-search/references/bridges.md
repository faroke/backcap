# Search Capability — Bridges Reference

---

## `blog-search`

**Status**: available

**Source**: blog | **Target**: search

**Events**: `PostPublished`

**Purpose**: Indexes published blog posts into the search engine.

### Install

```bash
npx @backcap/cli add blog-search
```

### How It Works

When a blog post is published, the bridge:
1. Receives the `PostPublished` event via the event bus.
2. Calls `indexDocument.execute({ indexName: "posts", documentId: event.postId, document: { title, slug, content, authorId, publishedAt } })`.
3. The post becomes searchable via `SearchDocuments`.

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

### Wiring

```typescript
import { createBridge } from './bridges/blog-search/blog-search.bridge.js';

const bridge = createBridge({ indexDocument: searchService.indexDocument });
bridge.wire(eventBus);
```
