import { Result } from "../../shared/result.js";

// SKU format: alphanumeric with optional hyphens, 3-50 chars
const SKU_REGEX = /^[A-Z0-9][A-Z0-9-]{1,48}[A-Z0-9]$/;

export class SKU {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<SKU, Error> {
    if (!value || typeof value !== "string") {
      return Result.fail(new Error("SKU value is required and must be a string"));
    }
    const upper = value.toUpperCase();
    if (!SKU_REGEX.test(upper)) {
      return Result.fail(
        new Error(`Invalid SKU format: "${value}". Must be 3-50 alphanumeric characters with optional hyphens.`),
      );
    }
    return Result.ok(new SKU(upper));
  }

  equals(other: SKU): boolean {
    return this.value === other.value;
  }
}
