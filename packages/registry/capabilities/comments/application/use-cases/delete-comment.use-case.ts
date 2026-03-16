// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { CommentNotFound } from "../../domain/errors/comment-not-found.error.js";
import { UnauthorizedDelete } from "../../domain/errors/unauthorized-delete.error.js";
import type { ICommentRepository } from "../ports/comment-repository.port.js";
import type { DeleteCommentInput } from "../dto/delete-comment.dto.js";

export class DeleteComment {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(
    input: DeleteCommentInput,
  ): Promise<Result<{ commentId: string }, Error>> {
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      return Result.fail(CommentNotFound.create(input.commentId));
    }

    if (comment.authorId !== input.requesterId) {
      return Result.fail(UnauthorizedDelete.create(input.requesterId, input.commentId));
    }

    const deleted = comment.softDelete();
    await this.commentRepository.save(deleted);

    return Result.ok({ commentId: deleted.id });
  }
}
