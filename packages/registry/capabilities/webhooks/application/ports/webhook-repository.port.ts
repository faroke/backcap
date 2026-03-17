import type { Webhook } from "../../domain/entities/webhook.entity.js";

export interface WebhookFilters {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface IWebhookRepository {
  save(webhook: Webhook): Promise<void>;
  findById(id: string): Promise<Webhook | undefined>;
  findAll(
    filters: WebhookFilters,
  ): Promise<{ webhooks: Webhook[]; total: number }>;
}
