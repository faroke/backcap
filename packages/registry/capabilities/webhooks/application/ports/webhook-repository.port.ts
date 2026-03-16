import type { Webhook } from "../../domain/entities/webhook.entity.js";

export interface IWebhookRepository {
  findById(id: string): Promise<Webhook | null>;
  findAll(): Promise<Webhook[]>;
  save(webhook: Webhook): Promise<void>;
  delete(id: string): Promise<void>;
}
