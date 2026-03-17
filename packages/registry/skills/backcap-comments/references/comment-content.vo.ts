import { Result } from "../../shared/result.js";

export class CommentContent {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<CommentContent, Error> {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 10000) {
      return Result.fail(
        new Error(
          `Comment content must be between 1 and 10,000 characters after trimming. Got ${trimmed.length}.`,
        ),
      );
    }
    return Result.ok(new CommentContent(trimmed));
  }
}
