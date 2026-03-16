import type { AnalyticsEvent } from "../../domain/entities/analytics-event.entity.js";

export interface AnalyticsFilters {
  trackingId?: string;
  name?: string;
  userId?: string;
  sessionId?: string;
  from?: Date;
  to?: Date;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  topEvents: Array<{ name: string; count: number }>;
}

export interface IAnalyticsStore {
  record(event: AnalyticsEvent): Promise<void>;
  query(filters: AnalyticsFilters): Promise<AnalyticsEvent[]>;
  aggregate(filters: AnalyticsFilters): Promise<AnalyticsMetrics>;
}
