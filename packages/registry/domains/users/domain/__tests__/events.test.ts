import { describe, it, expect } from "vitest";
import { ProfileCreated } from "../events/profile-created.event.js";
import { ProfileUpdated } from "../events/profile-updated.event.js";

describe("ProfileCreated", () => {
  it("should construct with explicit occurredAt", () => {
    const date = new Date("2026-01-01");
    const event = new ProfileCreated("p-1", "u-1", "Jane", date);
    expect(event.profileId).toBe("p-1");
    expect(event.userId).toBe("u-1");
    expect(event.displayName).toBe("Jane");
    expect(event.occurredAt).toBe(date);
  });

  it("should construct with default occurredAt", () => {
    const before = new Date();
    const event = new ProfileCreated("p-1", "u-1", "Jane");
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should have readonly properties", () => {
    const event = new ProfileCreated("p-1", "u-1", "Jane");
    expect(event.profileId).toBe("p-1");
    expect(event.userId).toBe("u-1");
    expect(event.displayName).toBe("Jane");
  });
});

describe("ProfileUpdated", () => {
  it("should construct with explicit occurredAt", () => {
    const date = new Date("2026-01-01");
    const event = new ProfileUpdated("p-1", "u-1", ["displayName"], date);
    expect(event.profileId).toBe("p-1");
    expect(event.userId).toBe("u-1");
    expect(event.updatedFields).toEqual(["displayName"]);
    expect(event.occurredAt).toBe(date);
  });

  it("should construct with default occurredAt", () => {
    const before = new Date();
    const event = new ProfileUpdated("p-1", "u-1", ["bio"]);
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should have readonly properties", () => {
    const event = new ProfileUpdated("p-1", "u-1", ["locale", "timezone"]);
    expect(event.updatedFields).toEqual(["locale", "timezone"]);
  });
});
