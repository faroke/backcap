import { describe, it, expect } from "vitest";
import { FlagToggled } from "../events/flag-toggled.event.js";

describe("FlagToggled event", () => {
  it("creates event with all properties", () => {
    const now = new Date();
    const event = new FlagToggled("flag-1", "dark-mode", true, now);

    expect(event.flagId).toBe("flag-1");
    expect(event.key).toBe("dark-mode");
    expect(event.isEnabled).toBe(true);
    expect(event.occurredAt).toBe(now);
  });

  it("defaults occurredAt to current date", () => {
    const before = new Date();
    const event = new FlagToggled("flag-1", "dark-mode", false);
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
