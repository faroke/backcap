export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }

  static currencyMismatch(a: string, b: string): MoneyError {
    return new MoneyError(`Currency mismatch: cannot operate on ${a} and ${b}`);
  }

  static negativeResult(): MoneyError {
    return new MoneyError("Subtraction would result in negative amount");
  }

  static invalidCurrency(code: string): MoneyError {
    return new MoneyError(`Invalid ISO 4217 currency code: "${code}"`);
  }

  static invalidAmount(reason: string): MoneyError {
    return new MoneyError(`Invalid amount: ${reason}`);
  }

  static invalidFactor(reason: string): MoneyError {
    return new MoneyError(`Invalid multiplication factor: ${reason}`);
  }
}
