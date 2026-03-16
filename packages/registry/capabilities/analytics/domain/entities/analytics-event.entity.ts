// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { TrackingId } from "../value-objects/tracking-id.vo.js";
import { InvalidTrackingId } from "../errors/invalid-tracking-id.error.js";

export class AnalyticsEvent {
  readonly id: string;
  readonly trackingId: TrackingId;
  readonly name: string;
  readonly properties: Record<string, unknown> | undefined;
  readonly userId: string | undefined;
  readonly sessionId: string | undefined;
  readonly occurredAt: Date;

  private constructor(
    id: string,
    trackingId: TrackingId,
    name: string,
    properties: Record<string, unknown> | undefined,
    userId: string | undefined,
    sessionId: string | undefined,
    occurredAt: Date,
  ) {
    this.id = id;
    this.trackingId = trackingId;
    this.name = name;
    this.properties = properties;
    this.userId = userId;
    this.sessionId = sessionId;
    this.occurredAt = occurredAt;
  }

  static create(params: {
    id: string;
    trackingId: string;
    name: string;
    properties?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    occurredAt?: Date;
  }): Result<AnalyticsEvent, InvalidTrackingId> {
    const trackingIdResult = TrackingId.create(params.trackingId);
    if (trackingIdResult.isFail()) {
      return Result.fail(trackingIdResult.unwrapError());
    }

    return Result.ok(
      new AnalyticsEvent(
        params.id,
        trackingIdResult.unwrap(),
        params.name,
        params.properties,
        params.userId,
        params.sessionId,
        params.occurredAt ?? new Date(),
      ),
    );
  }
}
