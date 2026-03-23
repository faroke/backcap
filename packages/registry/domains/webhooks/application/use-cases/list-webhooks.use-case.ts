import { Result } from "../../shared/result.js";
import type { IWebhookRepository } from "../ports/webhook-repository.port.js";
import type { IWebhookDelivery } from "../ports/webhook-delivery.port.js";
import type {
  ListWebhooksInput,
  ListWebhooksOutput,
} from "../dto/list-webhooks.dto.js";

export class ListWebhooks {
  constructor(
    private readonly webhookRepository: IWebhookRepository,
    private readonly webhookDelivery: IWebhookDelivery,
  ) {}

  async execute(
    input: ListWebhooksInput,
  ): Promise<Result<ListWebhooksOutput, Error>> {
    const { webhooks, total } = await this.webhookRepository.findAll({
      isActive: input.isActive,
      limit: input.limit,
      offset: input.offset,
    });

    return Result.ok({
      webhooks: webhooks.map((w) => ({
        id: w.id,
        url: w.url.value,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt,
      })),
      total,
    });
  }
}
