export interface TrackEventInput {
  trackingId: string;
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface TrackEventOutput {
  eventId: string;
  occurredAt: Date;
}
