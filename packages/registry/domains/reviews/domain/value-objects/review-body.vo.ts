import { Result } from "../../shared/result.js";
import { InvalidReviewBody } from "../errors/invalid-review-body.error.js";

export class ReviewBody {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<ReviewBody, InvalidReviewBody> {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 5000) {
      return Result.fail(InvalidReviewBody.create(trimmed.length));
    }
    return Result.ok(new ReviewBody(trimmed));
  }
}
