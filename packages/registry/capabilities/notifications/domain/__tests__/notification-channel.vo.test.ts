import { describe, it, expect } from "vitest";
import { NotificationChannel } from "../value-objects/notification-channel.vo.js";
import { InvalidChannel } from "../errors/invalid-channel.error.js";

describe("NotificationChannel VO", () => {
  it("creates a valid email channel", () => {
    const result = NotificationChannel.create("email");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("email");
    expect(result.unwrap().isEmail()).toBe(true);
  });

  it("creates a valid sms channel", () => {
    const result = NotificationChannel.create("sms");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("sms");
    expect(result.unwrap().isSms()).toBe(true);
  });

  it("creates a valid push channel", () => {
    const result = NotificationChannel.create("push");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("push");
    expect(result.unwrap().isPush()).toBe(true);
  });

  it("rejects an unknown channel", () => {
    const result = NotificationChannel.create("fax");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidChannel);
  });

  it("rejects empty string", () => {
    const result = NotificationChannel.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidChannel);
  });

  it("is immutable (readonly value)", () => {
    const channel = NotificationChannel.create("email").unwrap();
    expect(channel.value).toBe("email");
  });
});
