import { Result } from "../../shared/result.js";
import { InvalidDimensions } from "../errors/invalid-dimensions.error.js";

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
  ): Result<Dimensions, InvalidDimensions> {
    if (!Number.isInteger(width) || width <= 0) {
      return Result.fail(InvalidDimensions.create("width", width));
    }
    if (!Number.isInteger(height) || height <= 0) {
      return Result.fail(InvalidDimensions.create("height", height));
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
