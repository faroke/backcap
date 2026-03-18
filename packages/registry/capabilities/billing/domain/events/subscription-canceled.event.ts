export class SubscriptionCanceled {
  public readonly subscriptionId: string;
  public readonly customerId: string;
  public readonly reason: string | undefined;
  public readonly occurredAt: Date;

  constructor(subscriptionId: string, customerId: string, reason?: string, occurredAt: Date = new Date()) {
    this.subscriptionId = subscriptionId;
    this.customerId = customerId;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
