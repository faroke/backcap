export type {
  ICommentsService,
  PostCommentInput,
  PostCommentOutput,
  ListCommentsInput,
  ListCommentsOutput,
  DeleteCommentInput,
  DeleteCommentOutput,
} from "./comments.contract.js";

export { createCommentsService } from "./comments.factory.js";
export type { CommentsDeps } from "./comments.factory.js";
