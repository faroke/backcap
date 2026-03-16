# Blog Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities.

---

## `blog-search`

**Status**: available

**Dependencies**: `blog`, `search`

**Purpose**: Listens to the `PostPublished` domain event emitted by `PublishPost` and indexes
the post in a search engine via the `ISearchEngine` port.

### Install

```bash
npx @backcap/cli add bridge blog-search
```

### Wiring

```typescript
import { createBlogService } from './capabilities/blog/contracts/index.js';
import { createSearchService } from './capabilities/search/contracts/index.js';

const blogService = createBlogService({ postRepository });
const searchService = createSearchService({ searchEngine });

// Wire the bridge: on PostPublished, index the post
eventBus.subscribe("PostPublished", async (event) => {
  await searchService.indexDocument({
    indexName: "posts",
    documentId: event.postId,
    document: {
      title: event.title,
      slug: event.slug,
      authorId: event.authorId,
      publishedAt: event.publishedAt,
    },
  });
});
```

### Event Shape

The bridge consumes `PostPublished` by duck-typing:

```typescript
interface PostPublished {
  postId: string;
  title: string;
  slug: string;
  authorId: string;
  publishedAt: string;
}
```

---

## Bridge Conventions

| Rule | Detail |
|---|---|
| Event mirroring | Bridges re-declare the minimal event shape they consume |
| Zero npm deps | No framework imports in bridge logic |
| `shared/result.ts` inlined | Copied into the bridge; no shared npm package |
