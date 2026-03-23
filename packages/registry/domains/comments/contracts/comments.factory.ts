import type { ICommentRepository } from "../application/ports/comment-repository.port.js";
import { PostComment } from "../application/use-cases/post-comment.use-case.js";
import { ListComments } from "../application/use-cases/list-comments.use-case.js";
import { DeleteComment } from "../application/use-cases/delete-comment.use-case.js";
import type { ICommentsService } from "./comments.contract.js";

export type CommentsDeps = {
  commentRepository: ICommentRepository;
};

export function createCommentsService(deps: CommentsDeps): ICommentsService {
  const postComment = new PostComment(deps.commentRepository);
  const listComments = new ListComments(deps.commentRepository);
  const deleteComment = new DeleteComment(deps.commentRepository);

  return {
    postComment: (input) =>
      postComment.execute(input).then((r) => r.map((v) => v.output)),
    listComments: (input) => listComments.execute(input),
    deleteComment: (input) => deleteComment.execute(input),
  };
}
