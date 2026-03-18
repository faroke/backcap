export class SubscriptionNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionNotFound";
  }

  static create(id: string): SubscriptionNotFound {
    return new SubscriptionNotFound(`Subscription not found: "${id}"`);
  }
}
