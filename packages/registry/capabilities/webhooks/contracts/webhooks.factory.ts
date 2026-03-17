import type { IWebhookRepository } from "../application/ports/webhook-repository.port.js";
import type { IWebhookDelivery } from "../application/ports/webhook-delivery.port.js";
import { RegisterWebhook } from "../application/use-cases/register-webhook.use-case.js";
import { TriggerWebhook } from "../application/use-cases/trigger-webhook.use-case.js";
import { ListWebhooks } from "../application/use-cases/list-webhooks.use-case.js";
import type { IWebhooksService } from "./webhooks.contract.js";

export type WebhooksDeps = {
  webhookRepository: IWebhookRepository;
  webhookDelivery: IWebhookDelivery;
};

export function createWebhooksCapability(deps: WebhooksDeps): IWebhooksService {
  const registerWebhook = new RegisterWebhook(deps.webhookRepository, deps.webhookDelivery);
  const triggerWebhook = new TriggerWebhook(deps.webhookRepository, deps.webhookDelivery);
  const listWebhooks = new ListWebhooks(deps.webhookRepository, deps.webhookDelivery);

  return {
    register: (input) => registerWebhook.execute(input),
    trigger: (input) => triggerWebhook.execute(input),
    list: (input) => listWebhooks.execute(input),
  };
}
