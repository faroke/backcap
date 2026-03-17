import { AnalyticsEvent } from "../../../../domain/entities/analytics-event.entity.js";

export function createTestAnalyticsEvent(
  overrides?: Partial<{
    id: string;
    trackingId: string;
    name: string;
    properties: Record<string, unknown>;
    userId: string;
    sessionId: string;
    occurredAt: Date;
  }>,
): AnalyticsEvent {
  const result = AnalyticsEvent.create({
    id: overrides?.id ?? "test-evt-1",
    trackingId: overrides?.trackingId ?? "test-tracking-id",
    name: overrides?.name ?? "page_view",
    properties: overrides?.properties,
    userId: overrides?.userId,
    sessionId: overrides?.sessionId,
    occurredAt: overrides?.occurredAt,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test analytics event: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
