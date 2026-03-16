import type { Notification } from "../../../domain/entities/notification.entity.js";
import type { INotificationRepository } from "../../ports/notification-repository.port.js";

export class InMemoryNotificationRepository implements INotificationRepository {
  private store = new Map<string, Notification>();

  async save(notification: Notification): Promise<void> {
    this.store.set(notification.id, notification);
  }

  async findById(notificationId: string): Promise<Notification | null> {
    return this.store.get(notificationId) ?? null;
  }

  async findByRecipient(recipient: string): Promise<Notification[]> {
    return [...this.store.values()].filter((n) => n.recipient === recipient);
  }
}
