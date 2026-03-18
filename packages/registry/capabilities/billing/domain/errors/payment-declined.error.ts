export class PaymentDeclined extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentDeclined";
  }

  static create(reason?: string): PaymentDeclined {
    return new PaymentDeclined(reason ? `Payment declined: ${reason}` : "Payment declined");
  }
}
