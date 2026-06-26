export class CurrencyMismatch extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurrencyMismatch";
  }

  static create(currencyA: string, currencyB: string): CurrencyMismatch {
    return new CurrencyMismatch(`Currency mismatch: cannot operate on ${currencyA} and ${currencyB}`);
  }
}
