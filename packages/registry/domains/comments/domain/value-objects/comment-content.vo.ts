import { Result } from "../../shared/result.js";
import { InvalidCommentContent } from "../errors/invalid-comment-content.error.js";

export class CommentContent {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<CommentContent, InvalidCommentContent> {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 10000) {
      return Result.fail(InvalidCommentContent.create(trimmed.length));
    }
    return Result.ok(new CommentContent(trimmed));
  }
}
