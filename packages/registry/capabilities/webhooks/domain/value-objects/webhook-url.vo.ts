// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

const HTTP_URL_REGEX = /^https?:\/\/.+/;

export class WebhookUrl {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<WebhookUrl, InvalidWebhookUrl> {
    if (!value || !HTTP_URL_REGEX.test(value)) {
      return Result.fail(InvalidWebhookUrl.create(value));
    }
    try {
      new URL(value);
    } catch {
      return Result.fail(InvalidWebhookUrl.create(value));
    }
    return Result.ok(new WebhookUrl(value));
  }
}
