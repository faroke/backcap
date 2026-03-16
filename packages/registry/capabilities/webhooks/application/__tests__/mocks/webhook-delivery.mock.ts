import type { IWebhookDelivery, DeliveryResult } from "../../ports/webhook-delivery.port.js";

export class InMemoryWebhookDelivery implements IWebhookDelivery {
  public deliveries: Array<{ url: string; eventType: string }> = [];
  public shouldFail = false;

  async deliver(params: {
    url: string;
    eventType: string;
    payload: Record<string, unknown>;
    secret: string;
  }): Promise<DeliveryResult> {
    this.deliveries.push({ url: params.url, eventType: params.eventType });

    if (this.shouldFail) {
      return { statusCode: 500, success: false };
    }
    return { statusCode: 200, success: true };
  }
}
