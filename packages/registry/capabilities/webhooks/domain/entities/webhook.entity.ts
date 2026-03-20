import { Result } from "../../shared/result.js";
import { WebhookUrl } from "../value-objects/webhook-url.vo.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

export class Webhook {
  readonly id: string;
  readonly url: WebhookUrl;
  readonly events: string[];
  readonly secret: string;
  private _isActive: boolean;
  readonly createdAt: Date;

  get isActive(): boolean {
    return this._isActive;
  }

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
    this._isActive = isActive;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    url: string;
    events: string[];
    secret: string;
    isActive?: boolean;
    createdAt?: Date;
    allowPrivateUrl?: boolean;
  }): Result<Webhook, Error> {
    if (!params.events || params.events.length === 0) {
      return Result.fail(new Error("Webhook must subscribe to at least one event"));
    }

    const urlResult = WebhookUrl.create(params.url, {
      allowPrivate: params.allowPrivateUrl,
    });
    if (urlResult.isFail()) {
      return Result.fail(urlResult.unwrapError());
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

  activate(): Result<void, Error> {
    if (this._isActive) {
      return Result.fail(new Error("Webhook is already active"));
    }
    this._isActive = true;
    return Result.ok(undefined);
  }

  deactivate(): Result<void, Error> {
    if (!this._isActive) {
      return Result.fail(new Error("Webhook is already inactive"));
    }
    this._isActive = false;
    return Result.ok(undefined);
  }
}
