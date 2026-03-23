export interface GetMetricsInput {
  trackingId: string;
  fromDate: Date;
  toDate: Date;
}

export interface GetMetricsOutput {
  totalEvents: number;
  uniqueUsers: number;
  eventBreakdown: Array<{ name: string; count: number }>;
}
