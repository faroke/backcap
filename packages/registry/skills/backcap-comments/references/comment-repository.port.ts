import type { Comment } from "../../domain/entities/comment.entity.js";

export interface CommentFilters {
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface ICommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: string): Promise<Comment | undefined>;
  findByResource(
    resourceId: string,
    resourceType: string,
    filters: CommentFilters,
  ): Promise<{ comments: Comment[]; total: number }>;
}
