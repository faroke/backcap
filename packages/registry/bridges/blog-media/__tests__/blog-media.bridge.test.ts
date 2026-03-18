import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge, createBlogMediaResolver } from "../blog-media.bridge.js";

describe("blog-media bridge", () => {
  function mockCleanupBlogMediaReferences(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? { isFail: () => false }
          : { isFail: () => true, error: new Error("cleanup failed") },
      ),
    };
  }

  describe("event-driven: MediaDeleted → cleanup", () => {
    it("calls cleanupBlogMediaReferences on MediaDeleted", async () => {
      const bus = new InMemoryEventBus();
      const cleanupBlogMediaReferences = mockCleanupBlogMediaReferences();
      const bridge = createBridge({ cleanupBlogMediaReferences });

      bridge.wire(bus);

      await bus.publish("MediaDeleted", {
        mediaId: "media-1",
        occurredAt: new Date("2026-03-18"),
      });

      expect(cleanupBlogMediaReferences.execute).toHaveBeenCalledOnce();
      expect(cleanupBlogMediaReferences.execute).toHaveBeenCalledWith({
        mediaId: "media-1",
      });
    });

    it("logs error when cleanup returns failure result", async () => {
      const bus = new InMemoryEventBus();
      const cleanupBlogMediaReferences = mockCleanupBlogMediaReferences(false);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge({ cleanupBlogMediaReferences });

      bridge.wire(bus);

      await bus.publish("MediaDeleted", {
        mediaId: "media-1",
        occurredAt: new Date("2026-03-18"),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[blog-media] CleanupBlogMediaReferences failed:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("handles thrown exception gracefully without re-throwing", async () => {
      const bus = new InMemoryEventBus();
      const cleanupBlogMediaReferences = {
        execute: vi.fn().mockRejectedValue(new Error("crash")),
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge({ cleanupBlogMediaReferences });

      bridge.wire(bus);

      await expect(
        bus.publish("MediaDeleted", {
          mediaId: "media-1",
          occurredAt: new Date("2026-03-18"),
        }),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        "[blog-media] Failed to cleanup blog media references:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("DI: createBlogMediaResolver", () => {
    function mockGetMediaUrl(url: string | null) {
      return {
        execute: vi.fn().mockResolvedValue(
          url
            ? { isOk: () => true, isFail: () => false, unwrap: () => ({ url }) }
            : { isOk: () => false, isFail: () => true, unwrapError: () => new Error("not found") },
        ),
      };
    }

    it("resolves media URL for a given mediaId", async () => {
      const getMediaUrl = mockGetMediaUrl("https://cdn.example.com/photo.jpg");
      const resolver = createBlogMediaResolver({ getMediaUrl });

      const url = await resolver.getMediaUrl("media-1");

      expect(url).toBe("https://cdn.example.com/photo.jpg");
      expect(getMediaUrl.execute).toHaveBeenCalledWith({ mediaId: "media-1", purpose: undefined });
    });

    it("resolves media URL with a specific purpose", async () => {
      const getMediaUrl = mockGetMediaUrl("https://cdn.example.com/photo-thumb.jpg");
      const resolver = createBlogMediaResolver({ getMediaUrl });

      const url = await resolver.getMediaUrl("media-1", "thumbnail");

      expect(url).toBe("https://cdn.example.com/photo-thumb.jpg");
      expect(getMediaUrl.execute).toHaveBeenCalledWith({ mediaId: "media-1", purpose: "thumbnail" });
    });

    it("returns null when media is not found", async () => {
      const getMediaUrl = mockGetMediaUrl(null);
      const resolver = createBlogMediaResolver({ getMediaUrl });

      const url = await resolver.getMediaUrl("media-unknown");

      expect(url).toBeNull();
    });

    it("returns null and logs error when getMediaUrl throws", async () => {
      const getMediaUrl = {
        execute: vi.fn().mockRejectedValue(new Error("media service down")),
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const resolver = createBlogMediaResolver({ getMediaUrl });

      const url = await resolver.getMediaUrl("media-1");

      expect(url).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "[blog-media] Failed to resolve media URL:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
