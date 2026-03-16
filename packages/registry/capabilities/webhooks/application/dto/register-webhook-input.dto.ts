export interface RegisterWebhookInput {
  url: string;
  events: string[];
  secret: string;
}
