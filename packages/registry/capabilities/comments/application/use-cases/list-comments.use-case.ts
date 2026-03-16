// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { Comment } from "../../domain/entities/comment.entity.js";
import type { ICommentRepository } from "../ports/comment-repository.port.js";
import type { ListCommentsInput } from "../dto/list-comments.dto.js";

export class ListComments {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(
    input: ListCommentsInput,
  ): Promise<Result<Comment[], Error>> {
    const comments = await this.commentRepository.findByResource(
      input.resourceId,
      input.resourceType,
    );
    return Result.ok(comments);
  }
}
