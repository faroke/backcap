// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Webhook } from "../../domain/entities/webhook.entity.js";
import type { IWebhookRepository } from "../ports/webhook-repository.port.js";
import type { RegisterWebhookInput } from "../dto/register-webhook-input.dto.js";
import type { RegisterWebhookOutput } from "../dto/register-webhook-output.dto.js";

export class RegisterWebhook {
  constructor(private readonly webhookRepository: IWebhookRepository) {}

  async execute(
    input: RegisterWebhookInput,
  ): Promise<Result<RegisterWebhookOutput, Error>> {
    const id = crypto.randomUUID();
    const webhookResult = Webhook.create({
      id,
      url: input.url,
      events: input.events,
      secret: input.secret,
    });

    if (webhookResult.isFail()) {
      return Result.fail(webhookResult.unwrapError());
    }

    const webhook = webhookResult.unwrap();
    await this.webhookRepository.save(webhook);

    return Result.ok({ webhookId: webhook.id });
  }
}
