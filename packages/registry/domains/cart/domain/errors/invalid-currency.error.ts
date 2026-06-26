export class InvalidCurrency extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCurrency";
  }

  static create(value: string): InvalidCurrency {
    return new InvalidCurrency(`Invalid ISO 4217 currency code: "${value}"`);
  }
}
