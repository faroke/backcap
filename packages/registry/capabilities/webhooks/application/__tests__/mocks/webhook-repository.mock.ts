import type { Webhook } from "../../../domain/entities/webhook.entity.js";
import type { IWebhookRepository } from "../../ports/webhook-repository.port.js";

export class InMemoryWebhookRepository implements IWebhookRepository {
  private store = new Map<string, Webhook>();

  async save(webhook: Webhook): Promise<void> {
    this.store.set(webhook.id, webhook);
  }

  async findById(id: string): Promise<Webhook | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Webhook[]> {
    return [...this.store.values()];
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
