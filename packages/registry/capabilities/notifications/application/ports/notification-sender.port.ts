import type { Notification } from "../../domain/entities/notification.entity.js";

export interface INotificationSender {
  send(notification: Notification): Promise<void>;
}
