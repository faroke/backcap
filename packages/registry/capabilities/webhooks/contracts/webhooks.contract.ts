import type { Result } from "../shared/result.js";

export interface WebhookRegisterInput {
  url: string;
  events: string[];
  secret: string;
}

export interface WebhookRegisterOutput {
  webhookId: string;
}

export interface WebhookTriggerInput {
  eventType: string;
  payload: Record<string, unknown>;
}

export interface WebhookTriggerOutput {
  delivered: number;
  failed: number;
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface WebhookListOutput {
  webhooks: WebhookItem[];
}

export interface IWebhooksService {
  register(input: WebhookRegisterInput): Promise<Result<WebhookRegisterOutput, Error>>;
  trigger(input: WebhookTriggerInput): Promise<Result<WebhookTriggerOutput, Error>>;
  list(): Promise<Result<WebhookListOutput, Error>>;
}
