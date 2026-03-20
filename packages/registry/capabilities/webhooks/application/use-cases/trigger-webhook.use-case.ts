import { Result } from "../../shared/result.js";
import { WebhookNotFound } from "../../domain/errors/webhook-not-found.error.js";
import { WebhookDeliveryFailed } from "../../domain/errors/webhook-delivery-failed.error.js";
import { WebhookDelivered } from "../../domain/events/webhook-delivered.event.js";
import { WebhookFailed } from "../../domain/events/webhook-failed.event.js";
import type { IWebhookRepository } from "../ports/webhook-repository.port.js";
import type { IWebhookDelivery } from "../ports/webhook-delivery.port.js";
import type {
  TriggerWebhookInput,
  TriggerWebhookOutput,
} from "../dto/trigger-webhook.dto.js";

export class TriggerWebhook {
  constructor(
    private readonly webhookRepository: IWebhookRepository,
    private readonly webhookDelivery: IWebhookDelivery,
  ) {}

  async execute(
    input: TriggerWebhookInput,
  ): Promise<
    Result<
      TriggerWebhookOutput & { event: WebhookDelivered },
      WebhookNotFound | WebhookDeliveryFailed
    >
  > {
    const webhook = await this.webhookRepository.findById(input.webhookId);
    if (!webhook) {
      return Result.fail(WebhookNotFound.create(input.webhookId));
    }

    if (!webhook.isActive) {
      return Result.fail(
        WebhookDeliveryFailed.create("Webhook is not active"),
      );
    }

    if (!webhook.events.includes(input.eventType)) {
      return Result.fail(
        WebhookDeliveryFailed.create(
          `Webhook is not subscribed to event type "${input.eventType}"`,
        ),
      );
    }

    const { statusCode } = await this.webhookDelivery.deliver(
      webhook.url.value,
      webhook.secret,
      input.eventType,
      input.payload,
    );

    if (statusCode >= 400) {
      return Result.fail(
        WebhookDeliveryFailed.create(`HTTP ${statusCode}`),
      );
    }

    const deliveredAt = new Date();
    const event = new WebhookDelivered(
      webhook.id,
      input.eventType,
      statusCode,
    );

    return Result.ok({ deliveredAt, statusCode, event });
  }
}
