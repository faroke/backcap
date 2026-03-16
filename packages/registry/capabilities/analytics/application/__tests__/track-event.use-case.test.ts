import { describe, it, expect, beforeEach } from "vitest";
import { TrackEvent } from "../use-cases/track-event.use-case.js";
import { InMemoryAnalyticsStore } from "./mocks/in-memory-analytics-store.mock.js";
import { InvalidTrackingId } from "../../domain/errors/invalid-tracking-id.error.js";

describe("TrackEvent use case", () => {
  let store: InMemoryAnalyticsStore;
  let trackEvent: TrackEvent;

  beforeEach(() => {
    store = new InMemoryAnalyticsStore();
    trackEvent = new TrackEvent(store);
  });

  it("tracks an event successfully", async () => {
    const result = await trackEvent.execute({
      trackingId: "abcd1234",
      name: "page_view",
      properties: { page: "/home" },
      userId: "user-1",
      sessionId: "session-1",
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.eventId).toBeDefined();
    expect(output.event.trackingId).toBe("abcd1234");
    expect(output.event.name).toBe("page_view");

    // Verify event was stored
    const events = await store.query({ trackingId: "abcd1234" });
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("page_view");
  });

  it("tracks an event without optional fields", async () => {
    const result = await trackEvent.execute({
      trackingId: "abcd1234",
      name: "click",
    });

    expect(result.isOk()).toBe(true);
    const events = await store.query({});
    expect(events).toHaveLength(1);
    expect(events[0].userId).toBeUndefined();
    expect(events[0].sessionId).toBeUndefined();
  });

  it("rejects invalid tracking ID", async () => {
    const result = await trackEvent.execute({
      trackingId: "bad",
      name: "page_view",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });
});
