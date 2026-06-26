export class InvalidSubscriptionStatus extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSubscriptionStatus";
  }

  static create(value: string, validValues: readonly string[]): InvalidSubscriptionStatus {
    return new InvalidSubscriptionStatus(
      `Invalid subscription status: "${value}". Valid: ${validValues.join(", ")}`,
    );
  }
}
