// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";

export class CommentContent {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<CommentContent, Error> {
    const trimmed = value.trim();
    if (trimmed.length < 1) {
      return Result.fail(new Error("Comment content cannot be empty"));
    }
    if (trimmed.length > 10000) {
      return Result.fail(
        new Error("Comment content cannot exceed 10000 characters"),
      );
    }
    return Result.ok(new CommentContent(trimmed));
  }
}
