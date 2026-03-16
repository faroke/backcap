import { Webhook } from "../../../domain/entities/webhook.entity.js";

export function createTestWebhook(
  overrides?: Partial<{
    id: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
  }>,
): Webhook {
  const result = Webhook.create({
    id: overrides?.id ?? "test-webhook-1",
    url: overrides?.url ?? "https://example.com/webhook",
    events: overrides?.events ?? ["user.created"],
    secret: overrides?.secret ?? "test-secret",
    isActive: overrides?.isActive ?? true,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test webhook: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
