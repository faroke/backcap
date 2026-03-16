import type { Result } from "../shared/result.js";
import type { AnalyticsEvent } from "../domain/entities/analytics-event.entity.js";
import type { AnalyticsMetrics } from "../application/ports/analytics-store.port.js";

export interface AnalyticsTrackInput {
  trackingId: string;
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsQueryInput {
  trackingId?: string;
  name?: string;
  userId?: string;
  sessionId?: string;
  from?: Date;
  to?: Date;
}

export interface AnalyticsMetricsInput {
  trackingId?: string;
  name?: string;
  userId?: string;
  from?: Date;
  to?: Date;
}

export interface IAnalyticsService {
  track(input: AnalyticsTrackInput): Promise<Result<{ eventId: string }, Error>>;
  query(input: AnalyticsQueryInput): Promise<Result<AnalyticsEvent[], Error>>;
  getMetrics(input: AnalyticsMetricsInput): Promise<Result<AnalyticsMetrics, Error>>;
}
