import { describe, it, expect, beforeEach } from "vitest";
import { SendNotification } from "../use-cases/send-notification.use-case.js";
import { InMemoryNotificationRepository } from "./mocks/notification-repository.mock.js";
import { InMemoryNotificationSender } from "./mocks/notification-sender.mock.js";
import { InvalidChannel } from "../../domain/errors/invalid-channel.error.js";
import { NotificationDeliveryFailed } from "../../domain/errors/notification-delivery-failed.error.js";

describe("SendNotification use case", () => {
  let notifRepo: InMemoryNotificationRepository;
  let notifSender: InMemoryNotificationSender;
  let sendNotification: SendNotification;

  beforeEach(() => {
    notifRepo = new InMemoryNotificationRepository();
    notifSender = new InMemoryNotificationSender();
    sendNotification = new SendNotification(notifSender, notifRepo);
  });

  it("sends a notification successfully", async () => {
    const result = await sendNotification.execute({
      channel: "email",
      recipient: "user@example.com",
      subject: "Welcome",
      body: "Hello!",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.output.notificationId).toBeDefined();
    expect(output.event.recipient).toBe("user@example.com");
    expect(output.event.channel).toBe("email");

    // Verify persisted
    const saved = await notifRepo.findById(output.output.notificationId);
    expect(saved).not.toBeNull();
    expect(saved!.status).toBe("sent");
  });

  it("rejects invalid channel", async () => {
    const result = await sendNotification.execute({
      channel: "pigeon",
      recipient: "user@example.com",
      subject: "Welcome",
      body: "Hello!",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidChannel);
  });

  it("handles delivery failure", async () => {
    notifSender.shouldFail = true;

    const result = await sendNotification.execute({
      channel: "email",
      recipient: "user@example.com",
      subject: "Welcome",
      body: "Hello!",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(NotificationDeliveryFailed);
  });
});
