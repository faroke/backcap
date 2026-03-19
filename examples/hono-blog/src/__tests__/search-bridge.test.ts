import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySearchEngine } from "../adapters/in-memory-search-engine.js";
import { InMemoryEventBus } from "../shared/in-memory-event-bus.js";
import { createBridge } from "../bridges/blog-search/blog-search.bridge.js";

describe("Blog-Search bridge", () => {
  let searchEngine: InMemorySearchEngine;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    searchEngine = new InMemorySearchEngine();
    eventBus = new InMemoryEventBus();

    const bridge = createBridge({
      indexDocument: {
        async execute(input) {
          await searchEngine.indexDocument(input.indexName, input.documentId, input.document);
        },
      },
    });
    bridge.wire(eventBus);
  });

  it("indexes a published post in search", async () => {
    await eventBus.publish("PostPublished", {
      postId: "post-1",
      title: "Hello World",
      slug: "hello-world",
      content: "My first post",
      authorId: "user-1",
      publishedAt: new Date().toISOString(),
    });

    const exists = await searchEngine.documentExists("posts", "post-1");
    expect(exists).toBe(true);

    const { hits } = await searchEngine.search({
      indexName: "posts",
      query: "hello",
      page: 1,
      pageSize: 10,
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].document.title).toBe("Hello World");
  });

  it("indexes multiple posts", async () => {
    await eventBus.publish("PostPublished", {
      postId: "post-1",
      title: "First Post",
      slug: "first-post",
      content: "Content 1",
      authorId: "user-1",
      publishedAt: new Date().toISOString(),
    });

    await eventBus.publish("PostPublished", {
      postId: "post-2",
      title: "Second Post",
      slug: "second-post",
      content: "Content 2",
      authorId: "user-1",
      publishedAt: new Date().toISOString(),
    });

    const { hits, total } = await searchEngine.search({
      indexName: "posts",
      query: "post",
      page: 1,
      pageSize: 10,
    });
    expect(total).toBe(2);
    expect(hits).toHaveLength(2);
  });
});
