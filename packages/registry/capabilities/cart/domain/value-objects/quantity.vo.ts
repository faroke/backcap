// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidQuantity } from "../errors/invalid-quantity.error.js";

export class Quantity {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number, max: number = 99): Result<Quantity, InvalidQuantity> {
    if (!Number.isInteger(value)) {
      return Result.fail(InvalidQuantity.create("Quantity must be an integer"));
    }
    if (value < 1) {
      return Result.fail(InvalidQuantity.create("Quantity must be at least 1"));
    }
    if (value > max) {
      return Result.fail(InvalidQuantity.create(`Quantity cannot exceed ${max}`));
    }
    return Result.ok(new Quantity(value));
  }

  add(amount: number, max: number = 99): Result<Quantity, InvalidQuantity> {
    if (!Number.isInteger(amount) || amount < 1) {
      return Result.fail(InvalidQuantity.create("Amount to add must be a positive integer"));
    }
    return Quantity.create(this.value + amount, max);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
