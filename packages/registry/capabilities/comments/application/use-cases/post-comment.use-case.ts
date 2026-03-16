// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Comment } from "../../domain/entities/comment.entity.js";
import { CommentPosted } from "../../domain/events/comment-posted.event.js";
import type { ICommentRepository } from "../ports/comment-repository.port.js";
import type { PostCommentInput } from "../dto/post-comment.dto.js";

export class PostComment {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(
    input: PostCommentInput,
  ): Promise<Result<{ commentId: string; event: CommentPosted }, Error>> {
    const id = crypto.randomUUID();
    const commentResult = Comment.create({
      id,
      content: input.content,
      authorId: input.authorId,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      parentId: input.parentId,
    });

    if (commentResult.isFail()) {
      return Result.fail(commentResult.unwrapError());
    }

    const comment = commentResult.unwrap();
    await this.commentRepository.save(comment);

    const event = new CommentPosted(
      comment.id,
      comment.authorId,
      comment.resourceId,
      comment.resourceType,
    );

    return Result.ok({ commentId: comment.id, event });
  }
}
