export class InvalidRefund extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRefund";
  }

  static missingAmountOrCurrency(): InvalidRefund {
    return new InvalidRefund("Both amount and currency are required for partial refund");
  }
}
