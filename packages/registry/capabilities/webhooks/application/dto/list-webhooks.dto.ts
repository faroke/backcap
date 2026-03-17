export interface ListWebhooksInput {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListWebhooksOutput {
  webhooks: Array<{
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    createdAt: Date;
  }>;
  total: number;
}
