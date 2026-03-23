export interface RegisterWebhookInput {
  url: string;
  events: string[];
  secret: string;
}

export interface RegisterWebhookOutput {
  webhookId: string;
  createdAt: Date;
}
