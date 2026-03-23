export interface QueryEventsInput {
  trackingId?: string;
  name?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface QueryEventsOutput {
  events: Array<{
    eventId: string;
    trackingId: string;
    name: string;
    properties: Record<string, unknown> | undefined;
    userId: string | undefined;
    sessionId: string | undefined;
    occurredAt: Date;
  }>;
  total: number;
}
