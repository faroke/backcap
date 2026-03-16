import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../blog-comments.bridge.js";

describe("blog-comments bridge", () => {
  it("sends notification to post author on CommentPosted", async () => {
    const bus = new InMemoryEventBus();
    const getPost = {
      execute: vi.fn().mockResolvedValue({ authorId: "author-1" }),
    };
    const sendNotification = { execute: vi.fn().mockResolvedValue(undefined) };
    const bridge = createBridge({ getPost, sendNotification });

    bridge.wire(bus);

    await bus.publish("CommentPosted", {
      commentId: "c-1",
      resourceType: "post",
      resourceId: "p-1",
      authorId: "commenter-1",
      body: "Great post!",
    });

    expect(getPost.execute).toHaveBeenCalledWith({ postId: "p-1" });
    expect(sendNotification.execute).toHaveBeenCalledWith({
      userId: "author-1",
      message: "New comment on your post",
    });
  });

  it("does nothing when resourceType is not post", async () => {
    const bus = new InMemoryEventBus();
    const getPost = { execute: vi.fn() };
    const sendNotification = { execute: vi.fn() };
    const bridge = createBridge({ getPost, sendNotification });

    bridge.wire(bus);

    await bus.publish("CommentPosted", {
      commentId: "c-2",
      resourceType: "video",
      resourceId: "v-1",
      authorId: "commenter-1",
      body: "Nice video!",
    });

    expect(getPost.execute).not.toHaveBeenCalled();
    expect(sendNotification.execute).not.toHaveBeenCalled();
  });

  it("does nothing when post is not found", async () => {
    const bus = new InMemoryEventBus();
    const getPost = { execute: vi.fn().mockResolvedValue(null) };
    const sendNotification = { execute: vi.fn() };
    const bridge = createBridge({ getPost, sendNotification });

    bridge.wire(bus);

    await bus.publish("CommentPosted", {
      commentId: "c-3",
      resourceType: "post",
      resourceId: "p-999",
      authorId: "commenter-1",
      body: "Hello",
    });

    expect(getPost.execute).toHaveBeenCalled();
    expect(sendNotification.execute).not.toHaveBeenCalled();
  });

  it("handles errors gracefully without throwing", async () => {
    const bus = new InMemoryEventBus();
    const getPost = {
      execute: vi.fn().mockRejectedValue(new Error("db error")),
    };
    const sendNotification = { execute: vi.fn() };
    const bridge = createBridge({ getPost, sendNotification });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("CommentPosted", {
        commentId: "c-4",
        resourceType: "post",
        resourceId: "p-1",
        authorId: "commenter-1",
        body: "Test",
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
