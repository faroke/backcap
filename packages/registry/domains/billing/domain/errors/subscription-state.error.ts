export class SubscriptionStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionStateError";
  }

  static alreadyCanceled(): SubscriptionStateError {
    return new SubscriptionStateError("Subscription is already canceled");
  }

  static cannotChangePlanWhenCanceled(): SubscriptionStateError {
    return new SubscriptionStateError("Cannot change plan on a canceled subscription");
  }
}
