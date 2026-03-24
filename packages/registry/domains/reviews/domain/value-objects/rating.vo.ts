import { Result } from "../../shared/result.js";
import { InvalidRating } from "../errors/invalid-rating.error.js";

export class Rating {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): Result<Rating, InvalidRating> {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return Result.fail(InvalidRating.create(value));
    }
    return Result.ok(new Rating(value));
  }
}
