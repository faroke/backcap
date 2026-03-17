// Reference copy of capabilities/notifications/domain/entities/notification.entity.ts
// For skill documentation purposes — source of truth is the capability itself.

import { Result } from "../../shared/result.js";
import { NotificationChannel } from "../value-objects/notification-channel.vo.js";
import { InvalidChannel } from "../errors/invalid-channel.error.js";

export type NotificationStatus = "pending" | "sent" | "failed";

export class Notification {
  readonly id: string;
  readonly channel: NotificationChannel;
  readonly recipient: string;
  readonly subject: string;
  readonly body: string;
  readonly status: NotificationStatus;
  readonly sentAt: Date | null;

  private constructor(
    id: string,
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    body: string,
    status: NotificationStatus,
    sentAt: Date | null,
  ) {
    this.id = id;
    this.channel = channel;
    this.recipient = recipient;
    this.subject = subject;
    this.body = body;
    this.status = status;
    this.sentAt = sentAt;
  }

  static create(params: {
    id: string;
    channel: string;
    recipient: string;
    subject: string;
    body: string;
    status?: NotificationStatus;
    sentAt?: Date | null;
  }): Result<Notification, InvalidChannel> {
    const channelResult = NotificationChannel.create(params.channel);
    if (channelResult.isFail()) {
      return Result.fail(channelResult.unwrapError());
    }

    return Result.ok(
      new Notification(
        params.id,
        channelResult.unwrap(),
        params.recipient,
        params.subject,
        params.body,
        params.status ?? "pending",
        params.sentAt ?? null,
      ),
    );
  }

  markSent(): Notification {
    return new Notification(
      this.id,
      this.channel,
      this.recipient,
      this.subject,
      this.body,
      "sent",
      new Date(),
    );
  }

  markFailed(): Notification {
    return new Notification(
      this.id,
      this.channel,
      this.recipient,
      this.subject,
      this.body,
      "failed",
      this.sentAt,
    );
  }
}
