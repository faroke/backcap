export interface GetJobStatusInput {
  jobId: string;
}

export interface GetJobStatusOutput {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  scheduledAt: Date;
  createdAt: Date;
  failureReason?: string;
}
