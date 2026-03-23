import type { Notification } from "../../../domain/entities/notification.entity.js";
import type { INotificationSender } from "../../ports/notification-sender.port.js";

export class InMemoryNotificationSender implements INotificationSender {
  public sent: Notification[] = [];
  public shouldFail = false;

  async send(notification: Notification): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Delivery service unavailable");
    }
    this.sent.push(notification);
  }
}
