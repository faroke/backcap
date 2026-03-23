import { Result } from "../../shared/result.js";
import { Notification } from "../../domain/entities/notification.entity.js";
import { NotificationSent } from "../../domain/events/notification-sent.event.js";
import { NotificationDeliveryFailed } from "../../domain/errors/notification-delivery-failed.error.js";
import type { INotificationSender } from "../ports/notification-sender.port.js";
import type { INotificationRepository } from "../ports/notification-repository.port.js";
import type {
  SendNotificationInput,
  SendNotificationOutput,
} from "../dto/send-notification.dto.js";

export class SendNotification {
  constructor(
    private readonly notificationSender: INotificationSender,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    input: SendNotificationInput,
  ): Promise<Result<{ output: SendNotificationOutput; event: NotificationSent }, Error>> {
    const id = crypto.randomUUID();
    const notificationResult = Notification.create({
      id,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
    });

    if (notificationResult.isFail()) {
      return Result.fail(notificationResult.unwrapError());
    }

    let notification = notificationResult.unwrap();

    try {
      await this.notificationSender.send(notification);
      notification = notification.markSent();
    } catch (err) {
      notification = notification.markFailed();
      await this.notificationRepository.save(notification);
      return Result.fail(
        NotificationDeliveryFailed.create(id, err instanceof Error ? err.message : String(err)),
      );
    }

    await this.notificationRepository.save(notification);

    const event = new NotificationSent(
      notification.id,
      notification.recipient,
      notification.channel.value,
    );

    return Result.ok({ output: { notificationId: notification.id }, event });
  }
}
