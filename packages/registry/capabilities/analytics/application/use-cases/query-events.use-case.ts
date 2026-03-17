import { Result } from "../../shared/result.js";
import type { IAnalyticsStore } from "../ports/analytics-store.port.js";
import type { QueryEventsInput, QueryEventsOutput } from "../dto/query-events.dto.js";

export class QueryEvents {
  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async execute(
    input: QueryEventsInput,
  ): Promise<Result<QueryEventsOutput, Error>> {
    const { events, total } = await this.analyticsStore.query({
      trackingId: input.trackingId,
      name: input.name,
      fromDate: input.fromDate,
      toDate: input.toDate,
      limit: input.limit,
      offset: input.offset,
    });

    return Result.ok({
      events: events.map((e) => ({
        eventId: e.id,
        trackingId: e.trackingId.value,
        name: e.name,
        properties: e.properties,
        userId: e.userId,
        sessionId: e.sessionId,
        occurredAt: e.occurredAt,
      })),
      total,
    });
  }
}
