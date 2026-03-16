export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ListWebhooksOutput {
  webhooks: WebhookItem[];
}
