import type { INotificationSender } from "../application/ports/notification-sender.port.js";
import type { INotificationRepository } from "../application/ports/notification-repository.port.js";
import { SendNotification } from "../application/use-cases/send-notification.use-case.js";
import { GetNotifications } from "../application/use-cases/get-notifications.use-case.js";
import { MarkAsRead } from "../application/use-cases/mark-as-read.use-case.js";
import type { INotificationsService } from "./notifications.contract.js";

export type NotificationsServiceDeps = {
  notificationSender: INotificationSender;
  notificationRepository: INotificationRepository;
};

export function createNotificationsService(
  deps: NotificationsServiceDeps,
): INotificationsService {
  const sendNotification = new SendNotification(
    deps.notificationSender,
    deps.notificationRepository,
  );
  const getNotifications = new GetNotifications(deps.notificationRepository);
  const markAsRead = new MarkAsRead(deps.notificationRepository);

  return {
    send: async (input) => {
      const result = await sendNotification.execute(input);
      if (result.isFail()) {
        return result;
      }
      return result.map(({ output }) => output);
    },
    getByRecipient: (input) => getNotifications.execute(input),
    markAsRead: (input) => markAsRead.execute(input),
  };
}
