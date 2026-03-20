import { Result } from "../../shared/result.js";
import { InvalidWebhookUrl } from "../errors/invalid-webhook-url.error.js";

const PRIVATE_IP_PATTERNS = [
  /^https?:\/\/localhost([\/:?#]|$)/i,
  /^https?:\/\/127\.\d+\.\d+\.\d+/,
  /^https?:\/\/\[?::1\]?/,
  /^https?:\/\/10\.\d+\.\d+\.\d+/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/,
  /^https?:\/\/192\.168\.\d+\.\d+/,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/169\.254\.\d+\.\d+/,
  /^https?:\/\/\[?fe80:/i,
  /^https?:\/\/\[?fc00:/i,
  /^https?:\/\/\[?fd/i,
];

export class WebhookUrl {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(
    url: string,
    options?: { allowPrivate?: boolean },
  ): Result<WebhookUrl, InvalidWebhookUrl> {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return Result.fail(InvalidWebhookUrl.create(url));
      }
    } catch {
      return Result.fail(InvalidWebhookUrl.create(url));
    }

    const allowPrivate = options?.allowPrivate ?? false;
    if (!allowPrivate) {
      for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(url)) {
          return Result.fail(InvalidWebhookUrl.create(url));
        }
      }
    }

    return Result.ok(new WebhookUrl(url));
  }
}
