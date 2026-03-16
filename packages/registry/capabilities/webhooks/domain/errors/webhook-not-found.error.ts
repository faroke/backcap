export class WebhookNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookNotFound";
  }

  static create(webhookId: string): WebhookNotFound {
    return new WebhookNotFound(`Webhook not found with id: "${webhookId}"`);
  }
}
