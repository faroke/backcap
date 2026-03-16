// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import type { AnalyticsEvent } from "../../domain/entities/analytics-event.entity.js";
import type { IAnalyticsStore } from "../ports/analytics-store.port.js";
import type { QueryEventsInput } from "../dto/query-events.dto.js";

export class QueryEvents {
  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async execute(
    input: QueryEventsInput,
  ): Promise<Result<AnalyticsEvent[], Error>> {
    const events = await this.analyticsStore.query(input);
    return Result.ok(events);
  }
}
