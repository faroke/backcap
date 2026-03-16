import type { Notification } from "../../domain/entities/notification.entity.js";

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(notificationId: string): Promise<Notification | null>;
  findByRecipient(recipient: string): Promise<Notification[]>;
}
