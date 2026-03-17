import { describe, it, expect, beforeEach } from "vitest";
import { QueryEvents } from "../query-events.use-case.js";
import { InMemoryAnalyticsStore } from "./mocks/in-memory-analytics-store.mock.js";
import { createTestAnalyticsEvent } from "./fixtures/analytics-event.fixture.js";

describe("QueryEvents use case", () => {
  let store: InMemoryAnalyticsStore;
  let queryEvents: QueryEvents;

  beforeEach(() => {
    store = new InMemoryAnalyticsStore();
    queryEvents = new QueryEvents(store);
  });

  it("returns all events when no filters are provided", async () => {
    const evt1 = createTestAnalyticsEvent({ id: "evt-1" });
    const evt2 = createTestAnalyticsEvent({ id: "evt-2", name: "click" });
    await store.record(evt1);
    await store.record(evt2);

    const result = await queryEvents.execute({});
    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.events).toHaveLength(2);
    expect(output.total).toBe(2);
  });

  it("filters by tracking ID", async () => {
    const evt1 = createTestAnalyticsEvent({ id: "evt-1", trackingId: "site-aaaa1111" });
    const evt2 = createTestAnalyticsEvent({ id: "evt-2", trackingId: "site-bbbb2222" });
    await store.record(evt1);
    await store.record(evt2);

    const result = await queryEvents.execute({ trackingId: "site-aaaa1111" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().events).toHaveLength(1);
    expect(result.unwrap().events[0].trackingId).toBe("site-aaaa1111");
  });

  it("returns empty array when no events match", async () => {
    const result = await queryEvents.execute({ name: "nonexistent" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().events).toHaveLength(0);
    expect(result.unwrap().total).toBe(0);
  });
});
