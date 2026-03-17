import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../blog-search.bridge.js";

describe("blog-search bridge", () => {
  it("calls indexDocument on PostPublished", async () => {
    const bus = new InMemoryEventBus();
    const indexDocument = { execute: vi.fn().mockResolvedValue(undefined) };
    const bridge = createBridge({ indexDocument });

    bridge.wire(bus);

    await bus.publish("PostPublished", {
      postId: "p-1",
      title: "Hello World",
      slug: "hello-world",
      content: "This is the post content",
      authorId: "u-1",
      publishedAt: "2026-03-16T00:00:00Z",
    });

    expect(indexDocument.execute).toHaveBeenCalledOnce();
    expect(indexDocument.execute).toHaveBeenCalledWith({
      indexName: "posts",
      documentId: "p-1",
      document: {
        title: "Hello World",
        slug: "hello-world",
        content: "This is the post content",
        authorId: "u-1",
        publishedAt: "2026-03-16T00:00:00Z",
      },
    });
  });

  it("handles indexDocument failure gracefully without throwing", async () => {
    const bus = new InMemoryEventBus();
    const indexDocument = {
      execute: vi.fn().mockRejectedValue(new Error("search unavailable")),
    };
    const bridge = createBridge({ indexDocument });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("PostPublished", {
        postId: "p-1",
        title: "Hello",
        slug: "hello",
        content: "Some content",
        authorId: "u-1",
        publishedAt: "2026-03-16T00:00:00Z",
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
