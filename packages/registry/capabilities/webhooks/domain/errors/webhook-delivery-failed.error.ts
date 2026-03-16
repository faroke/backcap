export class WebhookDeliveryFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookDeliveryFailed";
  }

  static create(webhookId: string, reason: string): WebhookDeliveryFailed {
    return new WebhookDeliveryFailed(
      `Webhook delivery failed for id: "${webhookId}": ${reason}`,
    );
  }
}
