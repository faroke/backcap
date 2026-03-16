export class NotificationDeliveryFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationDeliveryFailed";
  }

  static create(notificationId: string, reason: string): NotificationDeliveryFailed {
    return new NotificationDeliveryFailed(
      `Notification "${notificationId}" delivery failed: ${reason}`,
    );
  }
}
