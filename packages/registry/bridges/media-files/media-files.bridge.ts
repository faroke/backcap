import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

// --- Event-driven types ---

interface MediaUploadedEvent {
  mediaId: string;
  name: string;
  mimeType: string;
  size: number;
  occurredAt: Date;
}

interface ProcessResult {
  isFail(): boolean;
  error?: Error;
}

export interface IProcessMedia {
  execute(input: { mediaId: string }): Promise<ProcessResult>;
}

// --- DI types: IMediaStorage adapter backed by IFileStorage ---

export interface IFileStorageBridge {
  upload(key: string, data: Buffer): Promise<void>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

export interface IMediaStorageAdapter {
  upload(key: string, data: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

export interface FileBackedMediaStorageDeps {
  fileStorage: IFileStorageBridge;
}

export function createFileBackedMediaStorage(deps: FileBackedMediaStorageDeps): IMediaStorageAdapter {
  return {
    async upload(key: string, data: Buffer): Promise<void> {
      try {
        await deps.fileStorage.upload(key, data);
      } catch (error) {
        console.error("[media-files] File storage upload failed:", error);
        throw error;
      }
    },

    async download(_key: string): Promise<Buffer> {
      throw new Error("[media-files] Download not supported via file-backed storage bridge");
    },

    async delete(key: string): Promise<void> {
      try {
        await deps.fileStorage.delete(key);
      } catch (error) {
        console.error("[media-files] File storage delete failed:", error);
        throw error;
      }
    },

    async getUrl(key: string): Promise<string> {
      try {
        return await deps.fileStorage.getUrl(key);
      } catch (error) {
        console.error("[media-files] File storage getUrl failed:", error);
        throw error;
      }
    },
  };
}

// --- Bridge ---

export interface MediaFilesBridgeDeps {
  processMedia: IProcessMedia;
}

export function createBridge(deps: MediaFilesBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<MediaUploadedEvent>("MediaUploaded", async (event) => {
        try {
          const processResult = await deps.processMedia.execute({
            mediaId: event.mediaId,
          });

          if (processResult.isFail()) {
            console.error("[media-files] ProcessMedia failed:", processResult.error);
          }
        } catch (error) {
          console.error("[media-files] Failed to handle MediaUploaded:", error);
        }
      });
    },
  };
}
