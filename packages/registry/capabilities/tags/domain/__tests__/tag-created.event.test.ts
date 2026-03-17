import { describe, it, expect } from "vitest";
import { TagCreated } from "../events/tag-created.event.js";

describe("TagCreated domain event", () => {
  it("creates an event with default occurredAt", () => {
    const event = new TagCreated("tag-1", "javascript");
    expect(event.tagId).toBe("tag-1");
    expect(event.slug).toBe("javascript");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("accepts explicit occurredAt", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const event = new TagCreated("tag-1", "javascript", date);
    expect(event.occurredAt).toBe(date);
  });
});
