import type { Comment } from "../../../domain/entities/comment.entity.js";
import type { ICommentRepository } from "../../ports/comment-repository.port.js";

export class InMemoryCommentRepository implements ICommentRepository {
  private store = new Map<string, Comment>();

  async save(comment: Comment): Promise<void> {
    this.store.set(comment.id, comment);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.store.get(id) ?? null;
  }

  async findByResource(resourceId: string, resourceType: string): Promise<Comment[]> {
    return [...this.store.values()].filter(
      (c) => c.resourceId === resourceId && c.resourceType === resourceType,
    );
  }
}
