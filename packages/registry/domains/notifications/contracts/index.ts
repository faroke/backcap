export type {
  SendNotificationInput,
  SendNotificationOutput,
  GetNotificationsInput,
  GetNotificationsOutput,
  MarkAsReadInput,
  INotificationsService,
} from "./notifications.contract.js";

export { createNotificationsService } from "./notifications.factory.js";
export type { NotificationsServiceDeps } from "./notifications.factory.js";
