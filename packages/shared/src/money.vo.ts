import { Result } from "./result.js";
import { MoneyError } from "./errors/money.error.js";

export class Money {
  readonly amount: number;
  readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static create(amount: number, currency: string): Result<Money, MoneyError> {
    if (!Number.isInteger(amount)) {
      return Result.fail(MoneyError.invalidAmount("must be an integer (cents)"));
    }
    if (amount < 0) {
      return Result.fail(MoneyError.invalidAmount("cannot be negative"));
    }
    const upper = currency.toUpperCase();
    if (!/^[A-Z]{3}$/.test(upper)) {
      return Result.fail(MoneyError.invalidCurrency(currency));
    }
    return Result.ok(new Money(amount, upper));
  }

  static zero(currency: string): Result<Money, MoneyError> {
    return Money.create(0, currency);
  }

  add(other: Money): Result<Money, MoneyError> {
    if (this.currency !== other.currency) {
      return Result.fail(MoneyError.currencyMismatch(this.currency, other.currency));
    }
    return Result.ok(new Money(this.amount + other.amount, this.currency));
  }

  subtract(other: Money): Result<Money, MoneyError> {
    if (this.currency !== other.currency) {
      return Result.fail(MoneyError.currencyMismatch(this.currency, other.currency));
    }
    if (this.amount - other.amount < 0) {
      return Result.fail(MoneyError.negativeResult());
    }
    return Result.ok(new Money(this.amount - other.amount, this.currency));
  }

  multiply(factor: number): Result<Money, MoneyError> {
    if (!Number.isFinite(factor)) {
      return Result.fail(MoneyError.invalidFactor("must be a finite number"));
    }
    if (factor < 0) {
      return Result.fail(MoneyError.invalidFactor("cannot be negative"));
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
