export class InvalidPaymentMethod extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPaymentMethod";
  }

  static invalidLast4(): InvalidPaymentMethod {
    return new InvalidPaymentMethod("last4 must be exactly 4 digits");
  }

  static invalidExpiryMonth(): InvalidPaymentMethod {
    return new InvalidPaymentMethod("Expiry month must be between 1 and 12");
  }

  static invalidExpiryYear(): InvalidPaymentMethod {
    return new InvalidPaymentMethod("Expiry year must be between 2000 and 2100");
  }
}
