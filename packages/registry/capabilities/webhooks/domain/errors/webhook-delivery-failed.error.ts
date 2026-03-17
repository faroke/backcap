export class WebhookDeliveryFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookDeliveryFailed";
  }

  static create(reason: string): WebhookDeliveryFailed {
    return new WebhookDeliveryFailed(
      `Webhook delivery failed: ${reason}`,
    );
  }
}
