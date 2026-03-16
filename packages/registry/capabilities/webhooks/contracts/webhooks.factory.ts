import type { IWebhookRepository } from "../application/ports/webhook-repository.port.js";
import type { IWebhookDelivery } from "../application/ports/webhook-delivery.port.js";
import { RegisterWebhook } from "../application/use-cases/register-webhook.use-case.js";
import { TriggerWebhook } from "../application/use-cases/trigger-webhook.use-case.js";
import { ListWebhooks } from "../application/use-cases/list-webhooks.use-case.js";
import type { IWebhooksService } from "./webhooks.contract.js";

export type WebhooksServiceDeps = {
  webhookRepository: IWebhookRepository;
  webhookDelivery: IWebhookDelivery;
};

export function createWebhooksService(deps: WebhooksServiceDeps): IWebhooksService {
  const registerWebhook = new RegisterWebhook(deps.webhookRepository);
  const triggerWebhook = new TriggerWebhook(deps.webhookRepository, deps.webhookDelivery);
  const listWebhooks = new ListWebhooks(deps.webhookRepository);

  return {
    register: (input) => registerWebhook.execute(input),
    trigger: (input) => triggerWebhook.execute(input),
    list: () => listWebhooks.execute(),
  };
}
