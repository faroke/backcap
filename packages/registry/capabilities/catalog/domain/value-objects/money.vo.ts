// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidPrice } from "../errors/invalid-price.error.js";

export class Money {
  readonly cents: number;
  readonly currency: string;

  private constructor(cents: number, currency: string) {
    this.cents = cents;
    this.currency = currency;
  }

  static create(cents: number, currency: string = "USD"): Result<Money, InvalidPrice> {
    if (!Number.isInteger(cents)) {
      return Result.fail(InvalidPrice.create("Amount must be an integer (cents)"));
    }
    if (cents < 0) {
      return Result.fail(InvalidPrice.create("Amount cannot be negative"));
    }
    const upper = currency.toUpperCase();
    if (!/^[A-Z]{3}$/.test(upper)) {
      return Result.fail(InvalidPrice.create(`Invalid ISO 4217 currency code: "${currency}"`));
    }
    return Result.ok(new Money(cents, upper));
  }

  add(other: Money): Result<Money, InvalidPrice> {
    if (this.currency !== other.currency) {
      return Result.fail(InvalidPrice.create(`Cannot add different currencies: ${this.currency} and ${other.currency}`));
    }
    return Result.ok(new Money(this.cents + other.cents, this.currency));
  }

  subtract(other: Money): Result<Money, InvalidPrice> {
    if (this.currency !== other.currency) {
      return Result.fail(InvalidPrice.create(`Cannot subtract different currencies: ${this.currency} and ${other.currency}`));
    }
    if (this.cents - other.cents < 0) {
      return Result.fail(InvalidPrice.create("Subtraction would result in negative amount"));
    }
    return Result.ok(new Money(this.cents - other.cents, this.currency));
  }

  multiply(factor: number): Result<Money, InvalidPrice> {
    if (!Number.isFinite(factor)) {
      return Result.fail(InvalidPrice.create("Multiplication factor must be a finite number"));
    }
    if (factor < 0) {
      return Result.fail(InvalidPrice.create("Multiplication factor cannot be negative"));
    }
    return Result.ok(new Money(Math.round(this.cents * factor), this.currency));
  }

  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }
}
