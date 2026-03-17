import type { Comment } from "../../../../domain/entities/comment.entity.js";
import type { ICommentRepository, CommentFilters } from "../../../ports/comment-repository.port.js";

export class InMemoryCommentRepository implements ICommentRepository {
  private store = new Map<string, Comment>();

  async save(comment: Comment): Promise<void> {
    this.store.set(comment.id, comment);
  }

  async findById(id: string): Promise<Comment | undefined> {
    return this.store.get(id);
  }

  async findByResource(
    resourceId: string,
    resourceType: string,
    filters: CommentFilters,
  ): Promise<{ comments: Comment[]; total: number }> {
    let comments = [...this.store.values()].filter(
      (c) => c.resourceId === resourceId && c.resourceType === resourceType,
    );

    if (!filters.includeDeleted) {
      comments = comments.filter((c) => !c.deletedAt);
    }

    const total = comments.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? comments.length;
    comments = comments.slice(offset, offset + limit);

    return { comments, total };
  }
}
