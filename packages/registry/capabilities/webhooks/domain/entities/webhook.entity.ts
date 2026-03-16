// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { WebhookUrl } from "../value-objects/webhook-url.vo.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

export class Webhook {
  readonly id: string;
  readonly url: WebhookUrl;
  readonly events: string[];
  readonly secret: string;
  readonly isActive: boolean;
  readonly createdAt: Date;

  private constructor(
    id: string,
    url: WebhookUrl,
    events: string[],
    secret: string,
    isActive: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.url = url;
    this.events = events;
    this.secret = secret;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    url: string;
    events: string[];
    secret: string;
    isActive?: boolean;
    createdAt?: Date;
  }): Result<Webhook, InvalidWebhookUrl | Error> {
    const urlResult = WebhookUrl.create(params.url);
    if (urlResult.isFail()) {
      return Result.fail(urlResult.unwrapError());
    }

    if (!params.events || params.events.length === 0) {
      return Result.fail(new Error("Webhook must subscribe to at least one event"));
    }

    return Result.ok(
      new Webhook(
        params.id,
        urlResult.unwrap(),
        params.events,
        params.secret,
        params.isActive ?? true,
        params.createdAt ?? new Date(),
      ),
    );
  }

  activate(): Webhook {
    return new Webhook(
      this.id,
      this.url,
      this.events,
      this.secret,
      true,
      this.createdAt,
    );
  }

  deactivate(): Webhook {
    return new Webhook(
      this.id,
      this.url,
      this.events,
      this.secret,
      false,
      this.createdAt,
    );
  }
}
