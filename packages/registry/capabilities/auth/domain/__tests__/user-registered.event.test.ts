import { describe, it, expect } from "vitest";
import { UserRegistered } from "../events/user-registered.event.js";

describe("UserRegistered event", () => {
  it("constructs with explicit occurredAt", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const event = new UserRegistered("user-1", "user@example.com", date);
    expect(event.userId).toBe("user-1");
    expect(event.email).toBe("user@example.com");
    expect(event.occurredAt).toBe(date);
  });

  it("constructs with default occurredAt", () => {
    const before = new Date();
    const event = new UserRegistered("user-1", "user@example.com");
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("has readonly properties", () => {
    const event = new UserRegistered("user-1", "user@example.com");
    expect(event.userId).toBe("user-1");
    expect(event.email).toBe("user@example.com");
  });
});
