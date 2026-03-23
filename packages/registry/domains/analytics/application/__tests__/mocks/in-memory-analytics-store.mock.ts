import type { AnalyticsEvent } from "../../../domain/entities/analytics-event.entity.js";
import type {
  IAnalyticsStore,
  AnalyticsFilters,
  AnalyticsMetrics,
} from "../../ports/analytics-store.port.js";

export class InMemoryAnalyticsStore implements IAnalyticsStore {
  private store: AnalyticsEvent[] = [];

  async record(event: AnalyticsEvent): Promise<void> {
    this.store.push(event);
  }

  async query(
    filters: AnalyticsFilters,
  ): Promise<{ events: AnalyticsEvent[]; total: number }> {
    let events = [...this.store];

    if (filters.trackingId) {
      events = events.filter((e) => e.trackingId.value === filters.trackingId);
    }
    if (filters.name) {
      events = events.filter((e) => e.name === filters.name);
    }
    if (filters.fromDate) {
      events = events.filter((e) => e.occurredAt >= filters.fromDate!);
    }
    if (filters.toDate) {
      events = events.filter((e) => e.occurredAt <= filters.toDate!);
    }

    const total = events.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? events.length;
    events = events.slice(offset, offset + limit);

    return { events, total };
  }

  async aggregate(
    trackingId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<AnalyticsMetrics> {
    const events = this.store.filter(
      (e) =>
        e.trackingId.value === trackingId &&
        e.occurredAt >= fromDate &&
        e.occurredAt <= toDate,
    );

    const uniqueUsers = new Set(events.filter((e) => e.userId).map((e) => e.userId)).size;
    const breakdown = new Map<string, number>();
    for (const e of events) {
      breakdown.set(e.name, (breakdown.get(e.name) ?? 0) + 1);
    }

    return {
      totalEvents: events.length,
      uniqueUsers,
      eventBreakdown: [...breakdown.entries()].map(([name, count]) => ({ name, count })),
    };
  }
}
