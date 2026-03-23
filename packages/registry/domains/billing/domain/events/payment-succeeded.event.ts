export class PaymentSucceeded {
  public readonly customerId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly occurredAt: Date;

  constructor(customerId: string, amount: number, currency: string, occurredAt: Date = new Date()) {
    this.customerId = customerId;
    this.amount = amount;
    this.currency = currency;
    this.occurredAt = occurredAt;
  }
}
