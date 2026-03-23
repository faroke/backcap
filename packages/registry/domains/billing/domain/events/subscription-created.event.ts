export class SubscriptionCreated {
  public readonly subscriptionId: string;
  public readonly customerId: string;
  public readonly planId: string;
  public readonly occurredAt: Date;

  constructor(subscriptionId: string, customerId: string, planId: string, occurredAt: Date = new Date()) {
    this.subscriptionId = subscriptionId;
    this.customerId = customerId;
    this.planId = planId;
    this.occurredAt = occurredAt;
  }
}
