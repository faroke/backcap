import { describe, it, expect } from "vitest";
import { UserRegistered } from "../domain/events/user-registered.event.js";

describe("UserRegistered (bridge event)", () => {
  it("creates event with explicit occurredAt", () => {
    const date = new Date("2025-01-01T00:00:00Z");
    const event = new UserRegistered({
      userId: "u-1",
      email: "a@b.com",
      occurredAt: date,
    });

    expect(event.userId).toBe("u-1");
    expect(event.email).toBe("a@b.com");
    expect(event.occurredAt).toBe(date);
  });

  it("defaults occurredAt to now when not provided", () => {
    const before = Date.now();
    const event = new UserRegistered({ userId: "u-2", email: "c@d.com" });
    const after = Date.now();

    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after);
  });
});
