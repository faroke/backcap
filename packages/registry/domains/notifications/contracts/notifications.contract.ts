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

export type {
  SendNotificationInput,
  SendNotificationOutput,
  GetNotificationsInput,
  GetNotificationsOutput,
  MarkAsReadInput,
};

export interface INotificationsService {
  send(input: SendNotificationInput): Promise<Result<SendNotificationOutput, Error>>;
  getByRecipient(input: GetNotificationsInput): Promise<Result<GetNotificationsOutput, Error>>;
  markAsRead(input: MarkAsReadInput): Promise<Result<void, Error>>;
}
