import { describe, it, expect } from "vitest";
import { EntryRecorded } from "../events/entry-recorded.event.js";

describe("EntryRecorded event", () => {
  it("creates event with all properties", () => {
    const now = new Date();
    const event = new EntryRecorded("entry-1", "user-123", "USER.LOGIN", "auth/session", now);

    expect(event.entryId).toBe("entry-1");
    expect(event.actor).toBe("user-123");
    expect(event.action).toBe("USER.LOGIN");
    expect(event.resource).toBe("auth/session");
    expect(event.occurredAt).toBe(now);
  });

  it("defaults occurredAt to current date", () => {
    const before = new Date();
    const event = new EntryRecorded("entry-1", "user-123", "USER.LOGIN", "auth/session");
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
