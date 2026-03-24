import { describe, it, expect, beforeEach } from "vitest";
import { GetFeed } from "../use-cases/get-feed.use-case.js";
import { InMemoryActivityStore } from "./mocks/in-memory-activity-store.mock.js";
import { createTestActivityEntry } from "./fixtures/activity-entry.fixture.js";

describe("GetFeed use case", () => {
  let activityStore: InMemoryActivityStore;
  let getFeed: GetFeed;

  beforeEach(async () => {
    activityStore = new InMemoryActivityStore();
    getFeed = new GetFeed(activityStore);

    // Seed 3 entries with different actors, actions, timestamps
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
        action: "invited",
        targetId: "project-999",
        targetName: "Project Beta",
        occurredAt: new Date("2025-01-02T10:00:00Z"),
      }),
    );
  });

  it("returns all entries when no filters provided (reverse-chronological)", async () => {
    const result = await getFeed.execute({});

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(3);
    expect(output.total).toBe(3);
    // Most recent first
    expect(output.entries[0].id).toBe("entry-3");
    expect(output.entries[1].id).toBe("entry-2");
    expect(output.entries[2].id).toBe("entry-1");
  });

  it("filters by action", async () => {
    const result = await getFeed.execute({ action: "invited" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(2);
    expect(output.entries.every((e) => e.action === "invited")).toBe(true);
  });

  it("filters by targetId", async () => {
    const result = await getFeed.execute({ targetId: "task-789" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].targetId).toBe("task-789");
  });

  it("filters by date range", async () => {
    const result = await getFeed.execute({
      fromDate: new Date("2025-01-01T10:30:00Z"),
      toDate: new Date("2025-01-01T23:59:59Z"),
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].id).toBe("entry-2");
  });

  it("supports pagination with limit and offset", async () => {
    const result = await getFeed.execute({ limit: 2, offset: 1 });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(2);
    expect(output.total).toBe(3);
  });

  it("returns empty result when no entries match", async () => {
    const result = await getFeed.execute({ targetId: "nonexistent" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.entries).toHaveLength(0);
    expect(output.total).toBe(0);
  });

  it("each entry includes summary string", async () => {
    const result = await getFeed.execute({});
    const output = result.unwrap();

    expect(output.entries[0].summary).toBe("Marie invited Project Beta");
    expect(output.entries[1].summary).toBe("Paul commented Fix login bug");
    expect(output.entries[2].summary).toBe("Marie invited Project Alpha");
  });
});
