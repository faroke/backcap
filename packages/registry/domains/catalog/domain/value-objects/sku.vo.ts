import { Result } from "../../shared/result.js";
import { InvalidSKU } from "../errors/invalid-sku.error.js";

// SKU format: alphanumeric with optional hyphens, 3-50 chars
const SKU_REGEX = /^[A-Z0-9][A-Z0-9-]{1,48}[A-Z0-9]$/;

export class SKU {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<SKU, InvalidSKU> {
    if (!value || typeof value !== "string") {
      return Result.fail(InvalidSKU.required());
    }
    const upper = value.toUpperCase();
    if (!SKU_REGEX.test(upper)) {
      return Result.fail(InvalidSKU.invalidFormat(value));
    }
    return Result.ok(new SKU(upper));
  }

  equals(other: SKU): boolean {
    return this.value === other.value;
  }
}
