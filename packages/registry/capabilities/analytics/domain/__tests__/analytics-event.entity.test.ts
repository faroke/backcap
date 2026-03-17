import { describe, it, expect } from "vitest";
import { AnalyticsEvent } from "../entities/analytics-event.entity.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

describe("AnalyticsEvent entity", () => {
  const validParams = {
    id: "evt-1",
    trackingId: "site-project-abc",
    name: "page_view",
  };

  it("creates an analytics event with required fields", () => {
    const result = AnalyticsEvent.create(validParams);
    expect(result.isOk()).toBe(true);
    const event = result.unwrap();
    expect(event.id).toBe("evt-1");
    expect(event.trackingId.value).toBe("site-project-abc");
    expect(event.name).toBe("page_view");
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.properties).toBeUndefined();
    expect(event.userId).toBeUndefined();
    expect(event.sessionId).toBeUndefined();
  });

  it("creates an analytics event with all optional fields", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = AnalyticsEvent.create({
      ...validParams,
      properties: { page: "/home" },
      userId: "user-1",
      sessionId: "session-1",
      occurredAt: now,
    });
    expect(result.isOk()).toBe(true);
    const event = result.unwrap();
    expect(event.properties).toEqual({ page: "/home" });
    expect(event.userId).toBe("user-1");
    expect(event.sessionId).toBe("session-1");
    expect(event.occurredAt).toBe(now);
  });

  it("fails with an invalid tracking ID", () => {
    const result = AnalyticsEvent.create({ ...validParams, trackingId: "short" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });

  it("is immutable — no mutation methods", () => {
    const event = AnalyticsEvent.create(validParams).unwrap();
    expect(typeof (event as Record<string, unknown>).publish).not.toBe("function");
    expect(typeof (event as Record<string, unknown>).update).not.toBe("function");
  });
});
