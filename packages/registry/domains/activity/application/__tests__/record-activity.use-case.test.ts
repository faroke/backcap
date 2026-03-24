import { describe, it, expect, beforeEach } from "vitest";
import { RecordActivity } from "../use-cases/record-activity.use-case.js";
import { InMemoryActivityStore } from "./mocks/in-memory-activity-store.mock.js";
import { InvalidAction } from "../../domain/errors/invalid-action.error.js";
import { InvalidActor } from "../../domain/errors/invalid-actor.error.js";
import { ActivityRecorded } from "../../domain/events/activity-recorded.event.js";

describe("RecordActivity use case", () => {
  let activityStore: InMemoryActivityStore;
  let recordActivity: RecordActivity;

  beforeEach(() => {
    activityStore = new InMemoryActivityStore();
    recordActivity = new RecordActivity(activityStore);
  });

  it("records a valid activity entry", async () => {
    const result = await recordActivity.execute({
      actor: { id: "user-123", displayName: "Marie" },
      action: "invited",
      targetId: "project-456",
      targetName: "Project Alpha",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.entryId).toBeDefined();
    expect(output.occurredAt).toBeInstanceOf(Date);
    expect(event).toBeInstanceOf(ActivityRecorded);
    expect(event.actorId).toBe("user-123");
    expect(event.actorDisplayName).toBe("Marie");
    expect(event.action).toBe("invited");
    expect(event.targetId).toBe("project-456");
    expect(event.targetName).toBe("Project Alpha");
  });

  it("records entry with metadata", async () => {
    const result = await recordActivity.execute({
      actor: { id: "user-123", displayName: "Marie" },
      action: "invited",
      targetId: "project-456",
      targetName: "Project Alpha",
      metadata: { role: "admin" },
    });

    expect(result.isOk()).toBe(true);
  });

  it("fails with InvalidAction when action format is invalid", async () => {
    const result = await recordActivity.execute({
      actor: { id: "user-123", displayName: "Marie" },
      action: "UPPER.CASE",
      targetId: "project-456",
      targetName: "Project Alpha",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("fails with InvalidActor when actor id is empty", async () => {
    const result = await recordActivity.execute({
      actor: { id: "", displayName: "Marie" },
      action: "invited",
      targetId: "project-456",
      targetName: "Project Alpha",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });
});
