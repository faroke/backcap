import type { ICommentRepository } from "../application/ports/comment-repository.port.js";
import { PostComment } from "../application/use-cases/post-comment.use-case.js";
import { ListComments } from "../application/use-cases/list-comments.use-case.js";
import { DeleteComment } from "../application/use-cases/delete-comment.use-case.js";
import type { ICommentsService } from "./comments.contract.js";

export type CommentsServiceDeps = {
  commentRepository: ICommentRepository;
};

export function createCommentsService(deps: CommentsServiceDeps): ICommentsService {
  const postComment = new PostComment(deps.commentRepository);
  const listComments = new ListComments(deps.commentRepository);
  const deleteComment = new DeleteComment(deps.commentRepository);

  return {
    post: (input) => postComment.execute(input),
    list: (input) => listComments.execute(input),
    delete: (input) => deleteComment.execute(input),
  };
}
