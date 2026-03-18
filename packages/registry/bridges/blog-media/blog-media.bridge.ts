import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

// --- Event-driven types ---

interface MediaDeletedEvent {
  mediaId: string;
  occurredAt: Date;
}

interface CleanupResult {
  isFail(): boolean;
  error?: Error;
}

export interface ICleanupBlogMediaReferences {
  execute(input: { mediaId: string }): Promise<CleanupResult>;
}

// --- DI types: media URL resolution for blog posts ---

interface GetMediaUrlResult {
  isOk(): boolean;
  isFail(): boolean;
  unwrap(): { url: string };
}

export interface IGetMediaUrl {
  execute(input: { mediaId: string; purpose?: string }): Promise<GetMediaUrlResult>;
}

export interface IBlogMediaResolver {
  getMediaUrl(mediaId: string, purpose?: string): Promise<string | null>;
}

// --- Bridge deps and factories ---

export interface BlogMediaBridgeDeps {
  cleanupBlogMediaReferences: ICleanupBlogMediaReferences;
}

export interface BlogMediaResolverDeps {
  getMediaUrl: IGetMediaUrl;
}

export function createBlogMediaResolver(deps: BlogMediaResolverDeps): IBlogMediaResolver {
  return {
    async getMediaUrl(mediaId: string, purpose?: string): Promise<string | null> {
      try {
        const result = await deps.getMediaUrl.execute({ mediaId, purpose });

        if (result.isFail()) {
          return null;
        }

        return result.unwrap().url;
      } catch (error) {
        console.error("[blog-media] Failed to resolve media URL:", error);
        return null;
      }
    },
  };
}

export function createBridge(deps: BlogMediaBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<MediaDeletedEvent>("MediaDeleted", async (event) => {
        try {
          const result = await deps.cleanupBlogMediaReferences.execute({
            mediaId: event.mediaId,
          });
          if (result.isFail()) {
            console.error("[blog-media] CleanupBlogMediaReferences failed:", result.error);
          }
        } catch (error) {
          console.error("[blog-media] Failed to cleanup blog media references:", error);
        }
      });
    },
  };
}
