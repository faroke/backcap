export interface DeliveryResult {
  statusCode: number;
  success: boolean;
}

export interface IWebhookDelivery {
  deliver(params: {
    url: string;
    eventType: string;
    payload: Record<string, unknown>;
    secret: string;
  }): Promise<DeliveryResult>;
}
