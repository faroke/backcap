export class PaymentFailed {
  public readonly customerId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly reason: string;
  public readonly occurredAt: Date;

  constructor(customerId: string, amount: number, currency: string, reason: string, occurredAt: Date = new Date()) {
    this.customerId = customerId;
    this.amount = amount;
    this.currency = currency;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
