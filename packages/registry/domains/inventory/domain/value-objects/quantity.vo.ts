import { Result } from "../../shared/result.js";
import { InvalidStockQuantity } from "../errors/invalid-stock-quantity.error.js";

export class Quantity {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): Result<Quantity, InvalidStockQuantity> {
    if (!Number.isInteger(value)) {
      return Result.fail(InvalidStockQuantity.create("Quantity must be an integer"));
    }
    if (value < 0) {
      return Result.fail(InvalidStockQuantity.create("Quantity cannot be negative"));
    }
    return Result.ok(new Quantity(value));
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  /** Trusted internal factory — skips validation. Caller must guarantee value >= 0 and integer. */
  static unsafeFrom(value: number): Quantity {
    if (value < 0 || !Number.isInteger(value)) {
      throw new Error(`Quantity.unsafeFrom invariant violated: ${value}`);
    }
    return new Quantity(value);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Result<Quantity, InvalidStockQuantity> {
    if (this.value - other.value < 0) {
      return Result.fail(InvalidStockQuantity.create("Subtraction would result in negative quantity"));
    }
    return Result.ok(new Quantity(this.value - other.value));
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isAtOrBelow(threshold: number): boolean {
    return this.value <= threshold;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
