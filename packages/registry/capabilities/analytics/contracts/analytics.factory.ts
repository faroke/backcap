import type { IAnalyticsStore } from "../application/ports/analytics-store.port.js";
import { TrackEvent } from "../application/use-cases/track-event.use-case.js";
import { QueryEvents } from "../application/use-cases/query-events.use-case.js";
import { GetMetrics } from "../application/use-cases/get-metrics.use-case.js";
import type { IAnalyticsService } from "./analytics.contract.js";

export type AnalyticsServiceDeps = {
  analyticsStore: IAnalyticsStore;
};

export function createAnalyticsService(deps: AnalyticsServiceDeps): IAnalyticsService {
  const trackEvent = new TrackEvent(deps.analyticsStore);
  const queryEvents = new QueryEvents(deps.analyticsStore);
  const getMetrics = new GetMetrics(deps.analyticsStore);

  return {
    track: (input) => trackEvent.execute(input),
    query: (input) => queryEvents.execute(input),
    getMetrics: (input) => getMetrics.execute(input),
  };
}
