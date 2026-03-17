import { describe, it, expect } from "vitest";
import { EventTracked } from "../events/event-tracked.event.js";

describe("EventTracked domain event", () => {
  it("creates an event with default occurredAt", () => {
    const event = new EventTracked("evt-1", "tracking-id-1", "page_view");
    expect(event.eventId).toBe("evt-1");
    expect(event.trackingId).toBe("tracking-id-1");
    expect(event.name).toBe("page_view");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates an event with explicit occurredAt", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const event = new EventTracked("evt-1", "tracking-id-1", "click", date);
    expect(event.occurredAt).toBe(date);
  });

  it("has all properties as readonly", () => {
    const event = new EventTracked("evt-1", "tracking-id-1", "page_view");
    expect(event.eventId).toBeDefined();
    expect(event.trackingId).toBeDefined();
    expect(event.name).toBeDefined();
    expect(event.occurredAt).toBeDefined();
  });
});
