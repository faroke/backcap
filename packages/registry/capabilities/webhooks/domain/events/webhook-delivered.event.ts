export class WebhookDelivered {
  public readonly webhookId: string;
  public readonly eventType: string;
  public readonly statusCode: number;
  public readonly occurredAt: Date;

  constructor(
    webhookId: string,
    eventType: string,
    statusCode: number,
    occurredAt: Date = new Date(),
  ) {
    this.webhookId = webhookId;
    this.eventType = eventType;
    this.statusCode = statusCode;
    this.occurredAt = occurredAt;
  }
}
