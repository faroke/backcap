// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { AnalyticsEvent } from "../../domain/entities/analytics-event.entity.js";
import { EventTracked } from "../../domain/events/event-tracked.event.js";
import type { IAnalyticsStore } from "../ports/analytics-store.port.js";
import type { TrackEventInput } from "../dto/track-event.dto.js";

export class TrackEvent {
  constructor(private readonly analyticsStore: IAnalyticsStore) {}

  async execute(
    input: TrackEventInput,
  ): Promise<Result<{ eventId: string; event: EventTracked }, Error>> {
    const id = crypto.randomUUID();
    const eventResult = AnalyticsEvent.create({
      id,
      trackingId: input.trackingId,
      name: input.name,
      properties: input.properties,
      userId: input.userId,
      sessionId: input.sessionId,
    });

    if (eventResult.isFail()) {
      return Result.fail(eventResult.unwrapError());
    }

    const analyticsEvent = eventResult.unwrap();
    await this.analyticsStore.record(analyticsEvent);

    const domainEvent = new EventTracked(
      analyticsEvent.id,
      analyticsEvent.trackingId.value,
      analyticsEvent.name,
      analyticsEvent.occurredAt,
    );

    return Result.ok({ eventId: analyticsEvent.id, event: domainEvent });
  }
}
