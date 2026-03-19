// Template: import type { IEventBus } from "{{shared_rel}}/event-bus.port.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";
// Template: import type { Bridge } from "{{shared_rel}}/bridge.js";
import type { Bridge } from "../../../shared/src/bridge.js";

export interface TagResourceInput {
  tagSlug: string;
  resourceId: string;
  resourceType: string;
}

export interface ITagResource {
  execute(input: TagResourceInput): Promise<void>;
}

export interface BlogTagsBridgeDeps {
  tagResource: ITagResource;
}

interface PostPublishedEvent {
  postId: string;
  tags?: string[];
}

export function createBridge(deps: BlogTagsBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<PostPublishedEvent>("PostPublished", async (event) => {
        try {
          if (!event.tags || event.tags.length === 0) {
            return;
          }

          for (const tag of event.tags) {
            await deps.tagResource.execute({
              tagSlug: tag,
              resourceId: event.postId,
              resourceType: "post",
            });
          }
        } catch (error) {
          console.error("[blog-tags] Failed to handle PostPublished:", error);
        }
      });
    },
  };
}
