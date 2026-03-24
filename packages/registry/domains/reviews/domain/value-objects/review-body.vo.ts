import { Result } from "../../shared/result.js";

export class ReviewBody {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<ReviewBody, Error> {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 5000) {
      return Result.fail(
        new Error(
          `Review body must be between 1 and 5,000 characters after trimming. Got ${trimmed.length}.`,
        ),
      );
    }
    return Result.ok(new ReviewBody(trimmed));
  }
}
