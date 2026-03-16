import { describe, it, expect } from "vitest";
import { AnalyticsEvent } from "../entities/analytics-event.entity.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

describe("AnalyticsEvent entity", () => {
  const validParams = {
    id: "event-1",
    trackingId: "abcd1234",
    name: "page_view",
  };

  it("creates a valid analytics event", () => {
    const result = AnalyticsEvent.create(validParams);
    expect(result.isOk()).toBe(true);
    const event = result.unwrap();
    expect(event.id).toBe("event-1");
    expect(event.trackingId.value).toBe("abcd1234");
    expect(event.name).toBe("page_view");
    expect(event.properties).toBeUndefined();
    expect(event.userId).toBeUndefined();
    expect(event.sessionId).toBeUndefined();
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("creates event with optional fields", () => {
    const result = AnalyticsEvent.create({
      ...validParams,
      properties: { page: "/home" },
      userId: "user-1",
      sessionId: "session-1",
    });
    expect(result.isOk()).toBe(true);
    const event = result.unwrap();
    expect(event.properties).toEqual({ page: "/home" });
    expect(event.userId).toBe("user-1");
    expect(event.sessionId).toBe("session-1");
  });

  it("fails with invalid tracking ID", () => {
    const result = AnalyticsEvent.create({ ...validParams, trackingId: "bad" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("uses provided occurredAt date", () => {
    const date = new Date("2025-01-01T00:00:00Z");
    const result = AnalyticsEvent.create({ ...validParams, occurredAt: date });
    expect(result.unwrap().occurredAt).toBe(date);
  });
});
