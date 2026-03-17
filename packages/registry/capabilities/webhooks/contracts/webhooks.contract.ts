import type { Result } from "../shared/result.js";
import type { Webhook } from "../domain/entities/webhook.entity.js";
import type { WebhookUrl } from "../domain/value-objects/webhook-url.vo.js";
import type { IWebhookDelivery } from "../application/ports/webhook-delivery.port.js";
import type { IWebhookRepository } from "../application/ports/webhook-repository.port.js";

export type { Webhook, WebhookUrl, IWebhookDelivery, IWebhookRepository };

export interface WebhooksRegisterInput {
  url: string;
  events: string[];
  secret: string;
}

export interface WebhooksRegisterOutput {
  webhookId: string;
  createdAt: Date;
}

export interface WebhooksTriggerInput {
  webhookId: string;
  eventType: string;
  payload: unknown;
}

export interface WebhooksTriggerOutput {
  deliveredAt: Date;
  statusCode: number;
}

export interface WebhooksListInput {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface WebhooksListOutput {
  webhooks: Array<{
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    createdAt: Date;
  }>;
  total: number;
}

export interface IWebhooksService {
  register(input: WebhooksRegisterInput): Promise<Result<WebhooksRegisterOutput, Error>>;
  trigger(input: WebhooksTriggerInput): Promise<Result<WebhooksTriggerOutput, Error>>;
  list(input: WebhooksListInput): Promise<Result<WebhooksListOutput, Error>>;
}
