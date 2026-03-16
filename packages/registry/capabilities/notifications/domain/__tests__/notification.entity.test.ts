import { describe, it, expect } from "vitest";
import { Notification } from "../entities/notification.entity.js";
import { InvalidChannel } from "../errors/invalid-channel.error.js";

describe("Notification entity", () => {
  const validParams = {
    id: "notif-1",
    channel: "email",
    recipient: "user@example.com",
    subject: "Welcome",
    body: "Welcome to the platform!",
  };

  it("creates a valid notification with default pending status", () => {
    const result = Notification.create(validParams);
    expect(result.isOk()).toBe(true);
    const notif = result.unwrap();
    expect(notif.id).toBe("notif-1");
    expect(notif.channel.value).toBe("email");
    expect(notif.recipient).toBe("user@example.com");
    expect(notif.subject).toBe("Welcome");
    expect(notif.body).toBe("Welcome to the platform!");
    expect(notif.status).toBe("pending");
    expect(notif.sentAt).toBeNull();
  });

  it("creates a notification for sms channel", () => {
    const result = Notification.create({ ...validParams, channel: "sms" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().channel.value).toBe("sms");
  });

  it("creates a notification for push channel", () => {
    const result = Notification.create({ ...validParams, channel: "push" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().channel.value).toBe("push");
  });

  it("fails with invalid channel", () => {
    const result = Notification.create({ ...validParams, channel: "fax" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidChannel);
  });

  it("markSent returns new notification with sent status and sentAt date", () => {
    const notif = Notification.create(validParams).unwrap();
    const sent = notif.markSent();
    expect(sent.status).toBe("sent");
    expect(sent.sentAt).toBeInstanceOf(Date);
    // Original is unchanged (immutable)
    expect(notif.status).toBe("pending");
    expect(notif.sentAt).toBeNull();
  });

  it("markFailed returns new notification with failed status", () => {
    const notif = Notification.create(validParams).unwrap();
    const failed = notif.markFailed();
    expect(failed.status).toBe("failed");
    // Original is unchanged (immutable)
    expect(notif.status).toBe("pending");
  });

  it("creates a notification with explicit status", () => {
    const result = Notification.create({ ...validParams, status: "sent" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().status).toBe("sent");
  });
});
