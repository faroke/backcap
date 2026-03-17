import { Result } from "../../shared/result.js";
import type { ICommentRepository } from "../ports/comment-repository.port.js";
import type { ListCommentsInput, ListCommentsOutput } from "../dto/list-comments.dto.js";

export class ListComments {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(
    input: ListCommentsInput,
  ): Promise<Result<ListCommentsOutput, Error>> {
    const { comments, total } = await this.commentRepository.findByResource(
      input.resourceId,
      input.resourceType,
      {
        includeDeleted: input.includeDeleted,
        limit: input.limit,
        offset: input.offset,
      },
    );

    return Result.ok({
      comments: comments.map((c) => ({
        commentId: c.id,
        content: c.content.value,
        authorId: c.authorId,
        resourceId: c.resourceId,
        resourceType: c.resourceType,
        parentId: c.parentId,
        createdAt: c.createdAt,
        deletedAt: c.deletedAt,
      })),
      total,
    });
  }
}
