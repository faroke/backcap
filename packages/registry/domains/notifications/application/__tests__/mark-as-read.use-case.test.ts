import { describe, it, expect, beforeEach } from "vitest";
import { MarkAsRead } from "../use-cases/mark-as-read.use-case.js";
import { InMemoryNotificationRepository } from "./mocks/notification-repository.mock.js";
import { createTestNotification } from "./fixtures/notification.fixture.js";
import { NotificationNotFound } from "../../domain/errors/notification-not-found.error.js";

describe("MarkAsRead use case", () => {
  let notifRepo: InMemoryNotificationRepository;
  let markAsRead: MarkAsRead;

  beforeEach(async () => {
    notifRepo = new InMemoryNotificationRepository();
    markAsRead = new MarkAsRead(notifRepo);

    await notifRepo.save(createTestNotification({ id: "notif-1" }));
  });

  it("marks a notification as read", async () => {
    const result = await markAsRead.execute({ notificationId: "notif-1" });

    expect(result.isOk()).toBe(true);

    const updated = await notifRepo.findById("notif-1");
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("sent");
  });

  it("fails when notification not found", async () => {
    const result = await markAsRead.execute({ notificationId: "nonexistent" });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(NotificationNotFound);
  });
});
