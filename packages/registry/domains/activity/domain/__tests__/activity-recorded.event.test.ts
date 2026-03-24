import { describe, it, expect } from "vitest";
import { ActivityRecorded } from "../events/activity-recorded.event.js";

describe("ActivityRecorded event", () => {
  it("creates event with all properties", () => {
    const now = new Date();
    const event = new ActivityRecorded(
      "entry-1",
      "user-123",
      "Marie",
      "invited",
      "project-456",
      "Project Alpha",
      now,
    );

    expect(event.entryId).toBe("entry-1");
    expect(event.actorId).toBe("user-123");
    expect(event.actorDisplayName).toBe("Marie");
    expect(event.action).toBe("invited");
    expect(event.targetId).toBe("project-456");
    expect(event.targetName).toBe("Project Alpha");
    expect(event.occurredAt).toBe(now);
  });

  it("defaults occurredAt to current date", () => {
    const before = new Date();
    const event = new ActivityRecorded(
      "entry-1",
      "user-123",
      "Marie",
      "invited",
      "project-456",
      "Project Alpha",
    );
    const after = new Date();

    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
