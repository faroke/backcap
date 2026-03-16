export class NotificationSent {
  public readonly notificationId: string;
  public readonly recipient: string;
  public readonly channel: string;
  public readonly occurredAt: Date;

  constructor(
    notificationId: string,
    recipient: string,
    channel: string,
    occurredAt: Date = new Date(),
  ) {
    this.notificationId = notificationId;
    this.recipient = recipient;
    this.channel = channel;
    this.occurredAt = occurredAt;
  }
}
