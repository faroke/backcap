import type { Result } from "../shared/result.js";
import type { Comment } from "../domain/entities/comment.entity.js";

export interface CommentsPostInput {
  content: string;
  authorId: string;
  resourceId: string;
  resourceType: string;
  parentId?: string;
}

export interface CommentsListInput {
  resourceId: string;
  resourceType: string;
}

export interface CommentsDeleteInput {
  commentId: string;
  requesterId: string;
}

export interface ICommentsService {
  post(input: CommentsPostInput): Promise<Result<{ commentId: string }, Error>>;
  list(input: CommentsListInput): Promise<Result<Comment[], Error>>;
  delete(input: CommentsDeleteInput): Promise<Result<{ commentId: string }, Error>>;
}
