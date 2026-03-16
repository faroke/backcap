import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

export interface IGetPost {
  execute(input: { postId: string }): Promise<{ authorId: string } | null>;
}

export interface ISendNotification {
  execute(input: { userId: string; message: string }): Promise<void>;
}

export interface BlogCommentsBridgeDeps {
  getPost: IGetPost;
  sendNotification: ISendNotification;
}

interface CommentPostedEvent {
  commentId: string;
  resourceType: string;
  resourceId: string;
  authorId: string;
  body: string;
}

export function createBridge(deps: BlogCommentsBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<CommentPostedEvent>("CommentPosted", async (event) => {
        try {
          if (event.resourceType !== "post") {
            return;
          }

          const post = await deps.getPost.execute({ postId: event.resourceId });
          if (!post) {
            return;
          }

          await deps.sendNotification.execute({
            userId: post.authorId,
            message: `New comment on your post`,
          });
        } catch (error) {
          console.error("[blog-comments] Failed to handle CommentPosted:", error);
        }
      });
    },
  };
}
