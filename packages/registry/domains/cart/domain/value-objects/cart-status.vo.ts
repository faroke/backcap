import { Result } from "../../shared/result.js";

export type CartStatusValue = "active" | "abandoned" | "converted";

export class CartStatus {
  readonly value: CartStatusValue;

  private constructor(value: CartStatusValue) {
    this.value = value;
  }

  static active(): CartStatus {
    return new CartStatus("active");
  }

  static abandoned(): CartStatus {
    return new CartStatus("abandoned");
  }

  static converted(): CartStatus {
    return new CartStatus("converted");
  }

  static from(value: string): Result<CartStatus, Error> {
    if (value === "active" || value === "abandoned" || value === "converted") {
      return Result.ok(new CartStatus(value));
    }
    return Result.fail(new Error(`Invalid cart status: "${value}"`));
  }

  isActive(): boolean {
    return this.value === "active";
  }

  isAbandoned(): boolean {
    return this.value === "abandoned";
  }

  isConverted(): boolean {
    return this.value === "converted";
  }

  equals(other: CartStatus): boolean {
    return this.value === other.value;
  }
}
