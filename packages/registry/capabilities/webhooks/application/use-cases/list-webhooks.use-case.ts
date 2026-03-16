// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { IWebhookRepository } from "../ports/webhook-repository.port.js";
import type { ListWebhooksOutput } from "../dto/list-webhooks-output.dto.js";

export class ListWebhooks {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async execute(): Promise<Result<ListWebhooksOutput, Error>> {
    const webhooks = await this.webhookRepository.findAll();

    return Result.ok({
      webhooks: webhooks.map((w) => ({
        id: w.id,
        url: w.url.value,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt,
      })),
    });
  }
}
