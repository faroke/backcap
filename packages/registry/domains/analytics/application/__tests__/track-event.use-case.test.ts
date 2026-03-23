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
      trackingId: "site-project-abc",
      name: "page_view",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.eventId).toBeDefined();
    expect(output.occurredAt).toBeInstanceOf(Date);
    expect(event.trackingId).toBe("site-project-abc");
    expect(event.name).toBe("page_view");
  });

  it("tracks an event with optional fields", async () => {
    const result = await trackEvent.execute({
      trackingId: "site-project-abc",
      name: "button_click",
      properties: { buttonId: "cta" },
      userId: "user-1",
      sessionId: "session-1",
    });

    expect(result.isOk()).toBe(true);
    const stored = await store.query({ trackingId: "site-project-abc" });
    expect(stored.events).toHaveLength(1);
    expect(stored.events[0].userId).toBe("user-1");
  });

  it("fails with an invalid tracking ID", async () => {
    const result = await trackEvent.execute({
      trackingId: "bad",
      name: "page_view",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(InvalidTrackingId);
  });
});
