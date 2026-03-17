import type { Result } from "../shared/result.js";
import type { PostCommentInput, PostCommentOutput } from "../application/dto/post-comment.dto.js";
import type { ListCommentsInput, ListCommentsOutput } from "../application/dto/list-comments.dto.js";
import type { DeleteCommentInput, DeleteCommentOutput } from "../application/dto/delete-comment.dto.js";

export type { PostCommentInput, PostCommentOutput };
export type { ListCommentsInput, ListCommentsOutput };
export type { DeleteCommentInput, DeleteCommentOutput };

export interface ICommentsService {
  postComment(input: PostCommentInput): Promise<Result<PostCommentOutput, Error>>;
  listComments(input: ListCommentsInput): Promise<Result<ListCommentsOutput, Error>>;
  deleteComment(input: DeleteCommentInput): Promise<Result<DeleteCommentOutput, Error>>;
}
