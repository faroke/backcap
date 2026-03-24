import { Result } from "../../shared/result.js";

export class Money {
  readonly amount: number;
  readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static create(amount: number, currency: string): Result<Money, Error> {
    if (!Number.isInteger(amount)) {
      return Result.fail(new Error("Invalid amount: must be an integer (cents)"));
    }
    if (amount < 0) {
      return Result.fail(new Error("Invalid amount: cannot be negative"));
    }
    const upper = currency.toUpperCase();
    if (!/^[A-Z]{3}$/.test(upper)) {
      return Result.fail(new Error(`Invalid ISO 4217 currency code: "${currency}"`));
    }
    return Result.ok(new Money(amount, upper));
  }

  static zero(currency: string): Result<Money, Error> {
    return Money.create(0, currency);
  }

  add(other: Money): Result<Money, Error> {
    if (this.currency !== other.currency) {
      return Result.fail(new Error(`Currency mismatch: cannot operate on ${this.currency} and ${other.currency}`));
    }
    return Result.ok(new Money(this.amount + other.amount, this.currency));
  }

  subtract(other: Money): Result<Money, Error> {
    if (this.currency !== other.currency) {
      return Result.fail(new Error(`Currency mismatch: cannot operate on ${this.currency} and ${other.currency}`));
    }
    return Result.ok(new Money(this.amount - other.amount, this.currency));
  }

  multiply(factor: number): Result<Money, Error> {
    if (!Number.isFinite(factor)) {
      return Result.fail(new Error("Invalid multiplication factor: must be a finite number"));
    }
    return Result.ok(new Money(Math.round(this.amount * factor), this.currency));
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
