export class InvalidWebhookUrl extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidWebhookUrl";
  }

  static create(url: string): InvalidWebhookUrl {
    return new InvalidWebhookUrl(`Invalid webhook URL: "${url}"`);
  }
}
