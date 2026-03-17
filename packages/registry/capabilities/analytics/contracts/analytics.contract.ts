import type { Result } from "../shared/result.js";
import type { TrackEventInput, TrackEventOutput } from "../application/dto/track-event.dto.js";
import type { QueryEventsInput, QueryEventsOutput } from "../application/dto/query-events.dto.js";
import type { GetMetricsInput, GetMetricsOutput } from "../application/dto/get-metrics.dto.js";

export type { TrackEventInput, TrackEventOutput };
export type { QueryEventsInput, QueryEventsOutput };
export type { GetMetricsInput, GetMetricsOutput };

export { AnalyticsEvent } from "../domain/entities/analytics-event.entity.js";
export { TrackingId } from "../domain/value-objects/tracking-id.vo.js";

export interface IAnalyticsService {
  trackEvent(input: TrackEventInput): Promise<Result<TrackEventOutput, Error>>;
  queryEvents(input: QueryEventsInput): Promise<Result<QueryEventsOutput, Error>>;
  getMetrics(input: GetMetricsInput): Promise<Result<GetMetricsOutput, Error>>;
}
