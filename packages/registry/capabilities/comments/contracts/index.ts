export type {
  CommentsPostInput,
  CommentsListInput,
  CommentsDeleteInput,
  ICommentsService,
} from "./comments.contract.js";

export { createCommentsService } from "./comments.factory.js";
export type { CommentsServiceDeps } from "./comments.factory.js";
