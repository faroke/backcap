import { Result } from "../../shared/result.js";
import type { INotificationRepository } from "../ports/notification-repository.port.js";
import type {
  GetNotificationsInput,
  GetNotificationsOutput,
} from "../dto/get-notifications.dto.js";

export class GetNotifications {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    input: GetNotificationsInput,
  ): Promise<Result<GetNotificationsOutput, never>> {
    const notifications = await this.notificationRepository.findByRecipient(input.recipient);

    return Result.ok({
      notifications: notifications.map((n) => ({
        id: n.id,
        channel: n.channel.value,
        recipient: n.recipient,
        subject: n.subject,
        body: n.body,
        status: n.status,
        sentAt: n.sentAt,
      })),
    });
  }
}
