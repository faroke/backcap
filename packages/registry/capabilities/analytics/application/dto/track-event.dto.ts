export interface TrackEventInput {
  trackingId: string;
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}
