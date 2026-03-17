import { Result } from "../../shared/result.js";
import type { IAnalyticsStore } from "../ports/analytics-store.port.js";
import type { GetMetricsInput, GetMetricsOutput } from "../dto/get-metrics.dto.js";

export class GetMetrics {
  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async execute(
    input: GetMetricsInput,
  ): Promise<Result<GetMetricsOutput, Error>> {
    const metrics = await this.analyticsStore.aggregate(
      input.trackingId,
      input.fromDate,
      input.toDate,
    );

    return Result.ok({
      totalEvents: metrics.totalEvents,
      uniqueUsers: metrics.uniqueUsers,
      eventBreakdown: metrics.eventBreakdown,
    });
  }
}
