import { describe, it, expect, beforeEach } from "vitest";
import { GetTimeline } from "../use-cases/get-timeline.use-case.js";
import { InMemoryActivityStore } from "./mocks/in-memory-activity-store.mock.js";
import { createTestActivityEntry } from "./fixtures/activity-entry.fixture.js";

describe("GetTimeline use case", () => {
  let activityStore: InMemoryActivityStore;
  let getTimeline: GetTimeline;

  beforeEach(async () => {
    activityStore = new InMemoryActivityStore();
    getTimeline = new GetTimeline(activityStore);

    // Seed 3 entries: 2 by user-123, 1 by user-456
    await activityStore.append(
      createTestActivityEntry({
        id: "entry-1",
        actor: { id: "user-123", displayName: "Marie" },
        action: "invited",
        targetId: "project-456",
        targetName: "Project Alpha",
        occurredAt: new Date("2025-01-01T10:00:00Z"),
      }),
    );
    await activityStore.append(
      createTestActivityEntry({
        id: "entry-2",
        actor: { id: "user-456", displayName: "Paul" },
        action: "commented",
        targetId: "task-789",
        targetName: "Fix login bug",
        occurredAt: new Date("2025-01-01T11:00:00Z"),
      }),
    );
    await activityStore.append(
      createTestActivityEntry({
        id: "entry-3",
        actor: { id: "user-123", displayName: "Marie" },
        action: "uploaded-file",
        targetId: "project-456",
        targetName: "Project Alpha",
        occurredAt: new Date("2025-01-02T10:00:00Z"),
      }),
    );
  });

  it("returns only entries for the specified actorId", async () => {
    const result = await getTimeline.execute({ actorId: "user-123" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(2);
    expect(output.entries.every((e) => e.actor.id === "user-123")).toBe(true);
  });

  it("filters by action within actor's timeline", async () => {
    const result = await getTimeline.execute({
      actorId: "user-123",
      action: "invited",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].action).toBe("invited");
  });

  it("supports pagination", async () => {
    const result = await getTimeline.execute({
      actorId: "user-123",
      limit: 1,
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.total).toBe(2);
  });

  it("returns empty result for unknown actorId", async () => {
    const result = await getTimeline.execute({ actorId: "user-999" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it("each entry includes summary string", async () => {
    const result = await getTimeline.execute({ actorId: "user-123" });
    const output = result.unwrap();

    // Most recent first
    expect(output.entries[0].summary).toBe("Marie uploaded-file Project Alpha");
    expect(output.entries[1].summary).toBe("Marie invited Project Alpha");
  });
});
