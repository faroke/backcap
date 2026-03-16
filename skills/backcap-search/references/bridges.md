# Search Capability — Bridges Reference

---

## `blog-search`

**Status**: available

**Dependencies**: `blog`, `search`

**Purpose**: Listens to the `PostPublished` domain event and indexes the published post
into the search engine.

### Install

```bash
npx @backcap/cli add bridge blog-search
```

### How It Works

When a blog post is published, the bridge:
1. Receives the `PostPublished` event (via event bus or direct invocation).
2. Calls `ISearchEngine.indexDocument("posts", event.postId, { title, slug, authorId })`.
3. The post becomes searchable via `SearchDocuments`.

### Event Shape

```typescript
interface PostPublished {
  postId: string;
  title: string;
  slug: string;
  authorId: string;
  publishedAt: string;
}
```

### Wiring Example

```typescript
eventBus.subscribe("PostPublished", async (event) => {
  await searchService.indexDocument({
    indexName: "posts",
    documentId: event.postId,
    document: {
      title: event.title,
      slug: event.slug,
      authorId: event.authorId,
    },
  });
});
```
