// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";

export class Dimensions {
  readonly width: number;
  readonly height: number;

  private constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  static create(
    width: number,
    height: number,
  ): Result<Dimensions, Error> {
    if (!Number.isInteger(width) || width <= 0) {
      return Result.fail(new Error(`Width must be a positive integer, got: ${width}`));
    }
    if (!Number.isInteger(height) || height <= 0) {
      return Result.fail(new Error(`Height must be a positive integer, got: ${height}`));
    }
    return Result.ok(new Dimensions(width, height));
  }

  get aspectRatio(): number {
    return this.width / this.height;
  }

  equals(other: Dimensions): boolean {
    return this.width === other.width && this.height === other.height;
  }
}
