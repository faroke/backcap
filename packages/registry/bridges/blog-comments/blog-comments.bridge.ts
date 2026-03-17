import type { IEventBus } from "../../../shared/src/event-bus.port.js";
import type { Bridge } from "../../../shared/src/bridge.js";

export interface IGetPost {
  execute(input: { postId: string }): Promise<{ authorId: string } | null>;
}

export interface SendNotificationInput {
  channel: string;
  recipient: string;
  subject: string;
  body: string;
}

export interface ISendNotification {
  execute(input: SendNotificationInput): Promise<void>;
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
            channel: "email",
            recipient: post.authorId,
            subject: "New comment on your post",
            body: `A new comment was posted: ${event.body.slice(0, 200)}`,
          });
        } catch (error) {
          console.error("[blog-comments] Failed to handle CommentPosted:", error);
        }
      });
    },
  };
}
