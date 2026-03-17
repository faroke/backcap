import { Result } from "../../shared/result.js";
import { CommentNotFound } from "../../domain/errors/comment-not-found.error.js";
import { UnauthorizedDelete } from "../../domain/errors/unauthorized-delete.error.js";
import type { ICommentRepository } from "../ports/comment-repository.port.js";
import type { DeleteCommentInput, DeleteCommentOutput } from "../dto/delete-comment.dto.js";

export class DeleteComment {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(
    input: DeleteCommentInput,
  ): Promise<Result<DeleteCommentOutput, CommentNotFound | UnauthorizedDelete>> {
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      return Result.fail(CommentNotFound.create(input.commentId));
    }

    if (input.requesterId !== comment.authorId) {
      return Result.fail(UnauthorizedDelete.create(input.requesterId, input.commentId));
    }

    const deleteResult = comment.softDelete();
    if (deleteResult.isFail()) {
      return Result.fail(deleteResult.unwrapError());
    }

    const deleted = deleteResult.unwrap();
    await this.commentRepository.save(deleted);

    return Result.ok({ deletedAt: deleted.deletedAt! });
  }
}
