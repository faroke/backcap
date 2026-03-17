// Reference copy of capabilities/notifications/application/ports/notification-sender.port.ts
// For skill documentation purposes — source of truth is the capability itself.

import type { Notification } from "../../domain/entities/notification.entity.js";

export interface INotificationSender {
  send(notification: Notification): Promise<void>;
}
