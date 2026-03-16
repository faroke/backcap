export interface TriggerWebhookInput {
  eventType: string;
  payload: Record<string, unknown>;
}
