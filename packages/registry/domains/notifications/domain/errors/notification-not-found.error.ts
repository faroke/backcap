export class NotificationNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationNotFound";
  }

  static create(notificationId: string): NotificationNotFound {
    return new NotificationNotFound(
      `Notification not found with id: "${notificationId}"`,
    );
  }
}
