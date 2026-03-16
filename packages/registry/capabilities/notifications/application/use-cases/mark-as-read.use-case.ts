// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { NotificationNotFound } from "../../domain/errors/notification-not-found.error.js";
import type { INotificationRepository } from "../ports/notification-repository.port.js";
import type { MarkAsReadInput } from "../dto/mark-as-read.dto.js";

export class MarkAsRead {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(input: MarkAsReadInput): Promise<Result<void, NotificationNotFound>> {
    const notification = await this.notificationRepository.findById(input.notificationId);
    if (!notification) {
      return Result.fail(NotificationNotFound.create(input.notificationId));
    }

    const updated = notification.markSent();
    await this.notificationRepository.save(updated);

    return Result.ok(undefined);
  }
}
