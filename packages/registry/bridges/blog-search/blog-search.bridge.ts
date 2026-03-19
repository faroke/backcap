// Template: import type { IEventBus } from "{{shared_rel}}/event-bus.port.js";
import type { IEventBus } from "../../../shared/src/event-bus.port.js";
// Template: import type { Bridge } from "{{shared_rel}}/bridge.js";
import type { Bridge } from "../../../shared/src/bridge.js";

export interface IndexDocumentInput {
  indexName: string;
  documentId: string;
  document: Record<string, unknown>;
}

export interface IIndexDocument {
  execute(input: IndexDocumentInput): Promise<void>;
}

export interface BlogSearchBridgeDeps {
  indexDocument: IIndexDocument;
}

interface PostPublishedEvent {
  postId: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  publishedAt: string;
}

export function createBridge(deps: BlogSearchBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<PostPublishedEvent>("PostPublished", async (event) => {
        try {
          await deps.indexDocument.execute({
            indexName: "posts",
            documentId: event.postId,
            document: {
              title: event.title,
              slug: event.slug,
              content: event.content,
              authorId: event.authorId,
              publishedAt: event.publishedAt,
            },
          });
        } catch (error) {
          console.error("[blog-search] Failed to index PostPublished:", error);
        }
      });
    },
  };
}
