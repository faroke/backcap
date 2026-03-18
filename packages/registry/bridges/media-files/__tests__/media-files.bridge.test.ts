import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../../shared/src/in-memory-event-bus.js";
import { createBridge, createFileBackedMediaStorage } from "../media-files.bridge.js";

describe("media-files bridge", () => {
  function mockProcessMedia(success = true) {
    return {
      execute: vi.fn().mockResolvedValue(
        success
          ? { isFail: () => false }
          : { isFail: () => true, error: new Error("processing failed") },
      ),
    };
  }

  describe("event-driven: MediaUploaded → process", () => {
    it("triggers processing on MediaUploaded", async () => {
      const bus = new InMemoryEventBus();
      const processMedia = mockProcessMedia();
      const bridge = createBridge({ processMedia });

      bridge.wire(bus);

      await bus.publish("MediaUploaded", {
        mediaId: "media-1",
        name: "photo.jpg",
        mimeType: "image/jpeg",
        size: 2048,
        occurredAt: new Date("2026-03-18"),
      });

      expect(processMedia.execute).toHaveBeenCalledOnce();
      expect(processMedia.execute).toHaveBeenCalledWith({
        mediaId: "media-1",
      });
    });

    it("logs error when processing returns failure result", async () => {
      const bus = new InMemoryEventBus();
      const processMedia = mockProcessMedia(false);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge({ processMedia });

      bridge.wire(bus);

      await bus.publish("MediaUploaded", {
        mediaId: "media-1",
        name: "photo.jpg",
        mimeType: "image/jpeg",
        size: 2048,
        occurredAt: new Date("2026-03-18"),
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[media-files] ProcessMedia failed:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("handles thrown exception from processMedia gracefully", async () => {
      const bus = new InMemoryEventBus();
      const processMedia = {
        execute: vi.fn().mockRejectedValue(new Error("processor crash")),
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const bridge = createBridge({ processMedia });

      bridge.wire(bus);

      await expect(
        bus.publish("MediaUploaded", {
          mediaId: "media-1",
          name: "photo.jpg",
          mimeType: "image/jpeg",
          size: 2048,
          occurredAt: new Date("2026-03-18"),
        }),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("DI: createFileBackedMediaStorage", () => {
    function mockFileStorage() {
      return {
        upload: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        getUrl: vi.fn().mockResolvedValue("https://files.example.com/uploads/photo.jpg"),
      };
    }

    it("delegates upload to file storage", async () => {
      const fileStorage = mockFileStorage();
      const adapter = createFileBackedMediaStorage({ fileStorage });
      const data = Buffer.from("file-data");

      await adapter.upload("uploads/photo.jpg", data);

      expect(fileStorage.upload).toHaveBeenCalledWith("uploads/photo.jpg", data);
    });

    it("delegates delete to file storage", async () => {
      const fileStorage = mockFileStorage();
      const adapter = createFileBackedMediaStorage({ fileStorage });

      await adapter.delete("uploads/photo.jpg");

      expect(fileStorage.delete).toHaveBeenCalledWith("uploads/photo.jpg");
    });

    it("delegates getUrl to file storage", async () => {
      const fileStorage = mockFileStorage();
      const adapter = createFileBackedMediaStorage({ fileStorage });

      const url = await adapter.getUrl("uploads/photo.jpg");

      expect(url).toBe("https://files.example.com/uploads/photo.jpg");
      expect(fileStorage.getUrl).toHaveBeenCalledWith("uploads/photo.jpg");
    });

    it("throws on download (not supported via bridge)", async () => {
      const fileStorage = mockFileStorage();
      const adapter = createFileBackedMediaStorage({ fileStorage });

      await expect(adapter.download("uploads/photo.jpg")).rejects.toThrow(
        "[media-files] Download not supported via file-backed storage bridge",
      );
    });

    it("re-throws when file storage upload fails", async () => {
      const fileStorage = mockFileStorage();
      fileStorage.upload.mockRejectedValue(new Error("disk full"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const adapter = createFileBackedMediaStorage({ fileStorage });

      await expect(adapter.upload("key", Buffer.from("data"))).rejects.toThrow("disk full");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("re-throws when file storage delete fails", async () => {
      const fileStorage = mockFileStorage();
      fileStorage.delete.mockRejectedValue(new Error("not found"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const adapter = createFileBackedMediaStorage({ fileStorage });

      await expect(adapter.delete("key")).rejects.toThrow("not found");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("re-throws when file storage getUrl fails", async () => {
      const fileStorage = mockFileStorage();
      fileStorage.getUrl.mockRejectedValue(new Error("not found"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const adapter = createFileBackedMediaStorage({ fileStorage });

      await expect(adapter.getUrl("key")).rejects.toThrow("not found");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
