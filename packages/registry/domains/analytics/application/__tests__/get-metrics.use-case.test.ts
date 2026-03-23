import { describe, it, expect, beforeEach } from "vitest";
import { GetMetrics } from "../use-cases/get-metrics.use-case.js";
import { InMemoryAnalyticsStore } from "./mocks/in-memory-analytics-store.mock.js";
import { createTestAnalyticsEvent } from "./fixtures/analytics-event.fixture.js";

describe("GetMetrics use case", () => {
  let store: InMemoryAnalyticsStore;
  let getMetrics: GetMetrics;

  beforeEach(() => {
    store = new InMemoryAnalyticsStore();
    getMetrics = new GetMetrics(store);
  });

  it("returns metrics for a tracking ID within a date range", async () => {
    const date = new Date("2026-06-15T12:00:00Z");
    const evt1 = createTestAnalyticsEvent({
      id: "evt-1",
      trackingId: "site-metrics-1",
      name: "page_view",
      userId: "user-1",
      occurredAt: date,
    });
    const evt2 = createTestAnalyticsEvent({
      id: "evt-2",
      trackingId: "site-metrics-1",
      name: "click",
      userId: "user-2",
      occurredAt: date,
    });
    await store.record(evt1);
    await store.record(evt2);

    const result = await getMetrics.execute({
      trackingId: "site-metrics-1",
      fromDate: new Date("2026-01-01"),
      toDate: new Date("2026-12-31"),
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalEvents).toBe(2);
    expect(output.uniqueUsers).toBe(2);
    expect(output.eventBreakdown).toHaveLength(2);
  });

  it("returns zero metrics when no events match", async () => {
    const result = await getMetrics.execute({
      trackingId: "nonexistent",
      fromDate: new Date("2026-01-01"),
      toDate: new Date("2026-12-31"),
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.totalEvents).toBe(0);
    expect(output.uniqueUsers).toBe(0);
    expect(output.eventBreakdown).toHaveLength(0);
  });
});
