import { Result } from "../../shared/result.js";
import { InvalidDiscountType } from "../errors/invalid-discount-type.error.js";

export type DiscountTypeValue = "percentage" | "fixed_amount" | "buy_x_get_y";

const VALID_TYPES: DiscountTypeValue[] = ["percentage", "fixed_amount", "buy_x_get_y"];

export class DiscountType {
  readonly value: DiscountTypeValue;

  private constructor(value: DiscountTypeValue) {
    this.value = value;
  }

  static create(value: string): Result<DiscountType, InvalidDiscountType> {
    if (!VALID_TYPES.includes(value as DiscountTypeValue)) {
      return Result.fail(InvalidDiscountType.create(value, VALID_TYPES));
    }
    return Result.ok(new DiscountType(value as DiscountTypeValue));
  }

  isPercentage(): boolean {
    return this.value === "percentage";
  }

  isFixedAmount(): boolean {
    return this.value === "fixed_amount";
  }

  isBuyXGetY(): boolean {
    return this.value === "buy_x_get_y";
  }
}
