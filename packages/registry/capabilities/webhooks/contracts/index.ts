export type {
  WebhookRegisterInput,
  WebhookRegisterOutput,
  WebhookTriggerInput,
  WebhookTriggerOutput,
  WebhookItem,
  WebhookListOutput,
  IWebhooksService,
} from "./webhooks.contract.js";

export { createWebhooksService } from "./webhooks.factory.js";
export type { WebhooksServiceDeps } from "./webhooks.factory.js";
