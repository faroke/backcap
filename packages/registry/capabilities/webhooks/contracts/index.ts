export type {
  IWebhookDelivery,
  IWebhookRepository,
  Webhook,
  WebhookUrl,
  WebhooksRegisterInput,
  WebhooksRegisterOutput,
  WebhooksTriggerInput,
  WebhooksTriggerOutput,
  WebhooksListInput,
  WebhooksListOutput,
  IWebhooksService,
} from "./webhooks.contract.js";

export { createWebhooksCapability } from "./webhooks.factory.js";
export type { WebhooksDeps } from "./webhooks.factory.js";
