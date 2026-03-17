import type { Webhook } from "../../../domain/entities/webhook.entity.js";
import type {
  IWebhookRepository,
  WebhookFilters,
} from "../../ports/webhook-repository.port.js";

export class InMemoryWebhookRepository implements IWebhookRepository {
  private store = new Map<string, Webhook>();

  async save(webhook: Webhook): Promise<void> {
    this.store.set(webhook.id, webhook);
  }

  async findById(id: string): Promise<Webhook | undefined> {
    return this.store.get(id);
  }

  async findAll(
    filters: WebhookFilters,
  ): Promise<{ webhooks: Webhook[]; total: number }> {
    let webhooks = [...this.store.values()];

    if (filters.isActive !== undefined) {
      webhooks = webhooks.filter((w) => w.isActive === filters.isActive);
    }

    const total = webhooks.length;

    if (filters.offset !== undefined) {
      webhooks = webhooks.slice(filters.offset);
    }
    if (filters.limit !== undefined) {
      webhooks = webhooks.slice(0, filters.limit);
    }

    return { webhooks, total };
  }
}
