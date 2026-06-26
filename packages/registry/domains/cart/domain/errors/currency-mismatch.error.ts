export class CurrencyMismatch extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CurrencyMismatch";
  }

  static create(cartCurrency: string, itemCurrency: string): CurrencyMismatch {
    return new CurrencyMismatch(
      `Currency mismatch: cart uses ${cartCurrency} but item uses ${itemCurrency}`,
    );
  }
}
