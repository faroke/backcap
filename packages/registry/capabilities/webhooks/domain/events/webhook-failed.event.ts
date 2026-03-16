export class WebhookFailed {
  public readonly webhookId: string;
  public readonly eventType: string;
  public readonly reason: string;
  public readonly occurredAt: Date;

  constructor(
    webhookId: string,
    eventType: string,
    reason: string,
    occurredAt: Date = new Date(),
  ) {
    this.webhookId = webhookId;
    this.eventType = eventType;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
