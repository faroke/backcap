export type {
  IAnalyticsService,
  TrackEventInput,
  TrackEventOutput,
  QueryEventsInput,
  QueryEventsOutput,
  GetMetricsInput,
  GetMetricsOutput,
} from "./analytics.contract.js";

export { AnalyticsEvent, TrackingId } from "./analytics.contract.js";

export { createAnalyticsCapability } from "./analytics.factory.js";
export type { AnalyticsDeps } from "./analytics.factory.js";
