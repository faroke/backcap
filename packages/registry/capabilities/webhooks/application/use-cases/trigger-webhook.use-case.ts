// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { WebhookDelivered } from "../../domain/events/webhook-delivered.event.js";
import { WebhookFailed } from "../../domain/events/webhook-failed.event.js";
import type { IWebhookRepository } from "../ports/webhook-repository.port.js";
import type { IWebhookDelivery } from "../ports/webhook-delivery.port.js";
import type { TriggerWebhookInput } from "../dto/trigger-webhook-input.dto.js";
import type { TriggerWebhookOutput } from "../dto/trigger-webhook-output.dto.js";

export class TriggerWebhook {
  constructor(
    private readonly webhookRepository: IWebhookRepository,
    private readonly webhookDelivery: IWebhookDelivery,
  ) {}

  async execute(
    input: TriggerWebhookInput,
  ): Promise<Result<TriggerWebhookOutput & { events: Array<WebhookDelivered | WebhookFailed> }, Error>> {
    const webhooks = await this.webhookRepository.findAll();
    const matching = webhooks.filter(
      (w) => w.isActive && w.events.includes(input.eventType),
    );

    let delivered = 0;
    let failed = 0;
    const events: Array<WebhookDelivered | WebhookFailed> = [];

    for (const webhook of matching) {
      const result = await this.webhookDelivery.deliver({
        url: webhook.url.value,
        eventType: input.eventType,
        payload: input.payload,
        secret: webhook.secret,
      });

      if (result.success) {
        delivered++;
        events.push(new WebhookDelivered(webhook.id, input.eventType, result.statusCode));
      } else {
        failed++;
        events.push(
          new WebhookFailed(
            webhook.id,
            input.eventType,
            `HTTP ${result.statusCode}`,
          ),
        );
      }
    }

    return Result.ok({ delivered, failed, events });
  }
}
