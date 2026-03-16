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

  async query(filters: AnalyticsFilters): Promise<AnalyticsEvent[]> {
    return this.store.filter((e) => {
      if (filters.trackingId && e.trackingId.value !== filters.trackingId) return false;
      if (filters.name && e.name !== filters.name) return false;
      if (filters.userId && e.userId !== filters.userId) return false;
      if (filters.sessionId && e.sessionId !== filters.sessionId) return false;
      if (filters.from && e.occurredAt < filters.from) return false;
      if (filters.to && e.occurredAt > filters.to) return false;
      return true;
    });
  }

  async aggregate(filters: AnalyticsFilters): Promise<AnalyticsMetrics> {
    const filtered = await this.query(filters);
    const userSet = new Set<string>();
    const sessionSet = new Set<string>();
    const eventCounts = new Map<string, number>();

    for (const event of filtered) {
      if (event.userId) userSet.add(event.userId);
      if (event.sessionId) sessionSet.add(event.sessionId);
      eventCounts.set(event.name, (eventCounts.get(event.name) ?? 0) + 1);
    }

    const topEvents = [...eventCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEvents: filtered.length,
      uniqueUsers: userSet.size,
      uniqueSessions: sessionSet.size,
      topEvents,
    };
  }
}
