import { Notification } from "../../../domain/entities/notification.entity.js";

export function createTestNotification(
  overrides?: Partial<{
    id: string;
    channel: string;
    recipient: string;
    subject: string;
    body: string;
  }>,
): Notification {
  const result = Notification.create({
    id: overrides?.id ?? "test-notif-1",
    channel: overrides?.channel ?? "email",
    recipient: overrides?.recipient ?? "user@example.com",
    subject: overrides?.subject ?? "Test Subject",
    body: overrides?.body ?? "Test body content",
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test notification: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
