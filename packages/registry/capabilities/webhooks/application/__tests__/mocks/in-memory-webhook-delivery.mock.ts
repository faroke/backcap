import type { IWebhookDelivery } from "../../ports/webhook-delivery.port.js";

export class InMemoryWebhookDelivery implements IWebhookDelivery {
  public deliveries: Array<{
    url: string;
    secret: string;
    eventType: string;
    payload: unknown;
  }> = [];
  public statusCode = 200;

  async deliver(
    url: string,
    secret: string,
    eventType: string,
    payload: unknown,
  ): Promise<{ statusCode: number }> {
    this.deliveries.push({ url, secret, eventType, payload });
    return { statusCode: this.statusCode };
  }
}
