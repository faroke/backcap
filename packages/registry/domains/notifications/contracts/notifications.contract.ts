import type { Result } from "../shared/result.js";
import type {
  SendNotificationInput,
  SendNotificationOutput,
} from "../application/dto/send-notification.dto.js";
import type {
  GetNotificationsInput,
  GetNotificationsOutput,
} from "../application/dto/get-notifications.dto.js";
import type { MarkAsReadInput } from "../application/dto/mark-as-read.dto.js";
import type { InvalidChannel } from "../domain/errors/invalid-channel.error.js";
import type { NotificationDeliveryFailed } from "../domain/errors/notification-delivery-failed.error.js";
import type { NotificationNotFound } from "../domain/errors/notification-not-found.error.js";

export type {
  SendNotificationInput,
  SendNotificationOutput,
  GetNotificationsInput,
  GetNotificationsOutput,
  MarkAsReadInput,
};

export interface INotificationsService {
  send(
    input: SendNotificationInput,
  ): Promise<Result<SendNotificationOutput, InvalidChannel | NotificationDeliveryFailed>>;
  getByRecipient(input: GetNotificationsInput): Promise<Result<GetNotificationsOutput, never>>;
  markAsRead(input: MarkAsReadInput): Promise<Result<void, NotificationNotFound>>;
}
