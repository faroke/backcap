import { describe, it, expect, beforeEach } from "vitest";
import { GetNotifications } from "../use-cases/get-notifications.use-case.js";
import { InMemoryNotificationRepository } from "./mocks/notification-repository.mock.js";
import { createTestNotification } from "./fixtures/notification.fixture.js";

describe("GetNotifications use case", () => {
  let notifRepo: InMemoryNotificationRepository;
  let getNotifications: GetNotifications;

  beforeEach(async () => {
    notifRepo = new InMemoryNotificationRepository();
    getNotifications = new GetNotifications(notifRepo);

    await notifRepo.save(createTestNotification({ id: "n1", recipient: "alice@example.com" }));
    await notifRepo.save(createTestNotification({ id: "n2", recipient: "alice@example.com" }));
    await notifRepo.save(createTestNotification({ id: "n3", recipient: "bob@example.com" }));
  });

  it("returns notifications for a recipient", async () => {
    const result = await getNotifications.execute({ recipient: "alice@example.com" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.notifications).toHaveLength(2);
  });

  it("returns empty array for unknown recipient", async () => {
    const result = await getNotifications.execute({ recipient: "unknown@example.com" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().notifications).toHaveLength(0);
  });
});
