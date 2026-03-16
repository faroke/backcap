import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge } from "../blog-tags.bridge.js";

describe("blog-tags bridge", () => {
  it("calls tagResource for each tag on PostPublished", async () => {
    const bus = new InMemoryEventBus();
    const tagResource = { execute: vi.fn().mockResolvedValue(undefined) };
    const bridge = createBridge({ tagResource });

    bridge.wire(bus);

    await bus.publish("PostPublished", {
      postId: "p-1",
      tags: ["typescript", "testing"],
    });

    expect(tagResource.execute).toHaveBeenCalledTimes(2);
    expect(tagResource.execute).toHaveBeenCalledWith({
      tagSlug: "typescript",
      resourceId: "p-1",
      resourceType: "post",
    });
    expect(tagResource.execute).toHaveBeenCalledWith({
      tagSlug: "testing",
      resourceId: "p-1",
      resourceType: "post",
    });
  });

  it("does nothing when tags is undefined", async () => {
    const bus = new InMemoryEventBus();
    const tagResource = { execute: vi.fn() };
    const bridge = createBridge({ tagResource });

    bridge.wire(bus);

    await bus.publish("PostPublished", { postId: "p-2" });

    expect(tagResource.execute).not.toHaveBeenCalled();
  });

  it("does nothing when tags is empty", async () => {
    const bus = new InMemoryEventBus();
    const tagResource = { execute: vi.fn() };
    const bridge = createBridge({ tagResource });

    bridge.wire(bus);

    await bus.publish("PostPublished", { postId: "p-3", tags: [] });

    expect(tagResource.execute).not.toHaveBeenCalled();
  });

  it("handles tagResource failure gracefully without throwing", async () => {
    const bus = new InMemoryEventBus();
    const tagResource = {
      execute: vi.fn().mockRejectedValue(new Error("tag service down")),
    };
    const bridge = createBridge({ tagResource });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    bridge.wire(bus);

    await expect(
      bus.publish("PostPublished", {
        postId: "p-1",
        tags: ["broken"],
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
