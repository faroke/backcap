import { describe, it, expect } from "vitest";
import { ActivityEntry } from "../entities/activity-entry.entity.js";
import { InvalidActor } from "../errors/invalid-actor.error.js";
import { InvalidAction } from "../errors/invalid-action.error.js";

describe("ActivityEntry entity", () => {
  const validParams = {
    id: "activity-1",
    actor: { id: "user-123", displayName: "Marie" },
    action: "invited",
    targetId: "project-456",
    targetName: "Project Alpha",
  };

  it("creates a valid activity entry with all required fields", () => {
    const result = ActivityEntry.create(validParams);
    expect(result.isOk()).toBe(true);
    const entry = result.unwrap();
    expect(entry.id).toBe("activity-1");
    expect(entry.actor.id).toBe("user-123");
    expect(entry.actor.displayName).toBe("Marie");
    expect(entry.action.value).toBe("invited");
    expect(entry.targetId).toBe("project-456");
    expect(entry.targetName).toBe("Project Alpha");
    expect(entry.metadata).toBeUndefined();
    expect(entry.occurredAt).toBeInstanceOf(Date);
  });

  it("sets occurredAt to current date when not provided", () => {
    const before = new Date();
    const entry = ActivityEntry.create(validParams).unwrap();
    const after = new Date();

    expect(entry.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entry.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("uses custom occurredAt when provided", () => {
    const custom = new Date("2025-06-01T12:00:00Z");
    const result = ActivityEntry.create({ ...validParams, occurredAt: custom });
    expect(result.unwrap().occurredAt).toEqual(custom);
  });

  it("includes optional metadata", () => {
    const metadata = { role: "admin", source: "web" };
    const result = ActivityEntry.create({ ...validParams, metadata });
    expect(result.unwrap().metadata).toEqual(metadata);
  });

  it("computes summary as '{displayName} {action} {targetName}'", () => {
    const entry = ActivityEntry.create(validParams).unwrap();
    expect(entry.summary).toBe("Marie invited Project Alpha");
  });

  it("fails with InvalidActor when actor id is empty", () => {
    const result = ActivityEntry.create({
      ...validParams,
      actor: { id: "", displayName: "Marie" },
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidActor);
  });

  it("fails with InvalidAction when action format is invalid", () => {
    const result = ActivityEntry.create({
      ...validParams,
      action: "UPPER.CASE",
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidAction);
  });

  it("fails when targetId is empty", () => {
    const result = ActivityEntry.create({ ...validParams, targetId: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("targetId");
  });

  it("fails when targetName is whitespace-only", () => {
    const result = ActivityEntry.create({ ...validParams, targetName: "   " });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("targetName");
  });

  it("trims targetId and targetName", () => {
    const result = ActivityEntry.create({
      ...validParams,
      targetId: "  project-456  ",
      targetName: "  Project Alpha  ",
    });
    expect(result.isOk()).toBe(true);
    const entry = result.unwrap();
    expect(entry.targetId).toBe("project-456");
    expect(entry.targetName).toBe("Project Alpha");
  });

  it("all fields are readonly", () => {
    const entry = ActivityEntry.create(validParams).unwrap();
    expect(entry.id).toBe("activity-1");
    expect(entry.actor.id).toBe("user-123");
    expect(entry.action.value).toBe("invited");
    expect(entry.targetId).toBe("project-456");
    expect(entry.targetName).toBe("Project Alpha");
    expect(entry.occurredAt).toBeInstanceOf(Date);
  });
});
