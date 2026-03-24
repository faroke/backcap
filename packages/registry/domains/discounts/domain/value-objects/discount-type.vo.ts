import { Result } from "../../shared/result.js";

export type DiscountTypeValue = "percentage" | "fixed_amount" | "buy_x_get_y";

const VALID_TYPES: DiscountTypeValue[] = ["percentage", "fixed_amount", "buy_x_get_y"];

export class DiscountType {
  readonly value: DiscountTypeValue;

  private constructor(value: DiscountTypeValue) {
    this.value = value;
  }

  static create(value: string): Result<DiscountType, Error> {
    if (!VALID_TYPES.includes(value as DiscountTypeValue)) {
      return Result.fail(new Error(`Invalid discount type: "${value}". Valid: ${VALID_TYPES.join(", ")}`));
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
