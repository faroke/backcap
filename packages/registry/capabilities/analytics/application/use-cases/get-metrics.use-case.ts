// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { IAnalyticsStore, AnalyticsMetrics } from "../ports/analytics-store.port.js";
import type { GetMetricsInput } from "../dto/get-metrics.dto.js";

export class GetMetrics {
  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async execute(
    input: GetMetricsInput,
  ): Promise<Result<AnalyticsMetrics, Error>> {
    const metrics = await this.analyticsStore.aggregate(input);
    return Result.ok(metrics);
  }
}
