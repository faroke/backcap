import type { Comment } from "../../domain/entities/comment.entity.js";

export interface ICommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: string): Promise<Comment | null>;
  findByResource(resourceId: string, resourceType: string): Promise<Comment[]>;
}
