export interface IWebhookDelivery {
  deliver(
    url: string,
    secret: string,
    eventType: string,
    payload: unknown,
  ): Promise<{ statusCode: number }>;
}
