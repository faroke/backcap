export interface TriggerWebhookInput {
  webhookId: string;
  eventType: string;
  payload: unknown;
}

export interface TriggerWebhookOutput {
  deliveredAt: Date;
  statusCode: number;
}
