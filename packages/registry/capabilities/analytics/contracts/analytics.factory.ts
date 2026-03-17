import type { IAnalyticsStore } from "../application/ports/analytics-store.port.js";
import { TrackEvent } from "../application/use-cases/track-event.use-case.js";
import { QueryEvents } from "../application/use-cases/query-events.use-case.js";
import { GetMetrics } from "../application/use-cases/get-metrics.use-case.js";
import type { IAnalyticsService } from "./analytics.contract.js";

export type AnalyticsDeps = {
  analyticsStore: IAnalyticsStore;
};

export function createAnalyticsCapability(deps: AnalyticsDeps): IAnalyticsService {
  const trackEvent = new TrackEvent(deps.analyticsStore);
  const queryEvents = new QueryEvents(deps.analyticsStore);
  const getMetrics = new GetMetrics(deps.analyticsStore);

  return {
    trackEvent: (input) =>
      trackEvent.execute(input).then((r) => r.map((v) => v.output)),
    queryEvents: (input) => queryEvents.execute(input),
    getMetrics: (input) => getMetrics.execute(input),
  };
}
