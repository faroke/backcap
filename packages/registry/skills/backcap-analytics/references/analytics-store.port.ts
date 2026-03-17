import type { AnalyticsEvent } from "../../domain/entities/analytics-event.entity.js";

export interface AnalyticsFilters {
  trackingId?: string;
  name?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  eventBreakdown: Array<{ name: string; count: number }>;
}

export interface IAnalyticsStore {
  record(event: AnalyticsEvent): Promise<void>;
  query(
    filters: AnalyticsFilters,
  ): Promise<{ events: AnalyticsEvent[]; total: number }>;
  aggregate(
    trackingId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<AnalyticsMetrics>;
}
