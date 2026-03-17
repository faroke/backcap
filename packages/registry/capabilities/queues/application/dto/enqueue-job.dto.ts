export interface EnqueueJobInput {
  type: string;
  payload: Record<string, unknown>;
  scheduledAt?: Date;
}

export interface EnqueueJobOutput {
  jobId: string;
  scheduledAt: Date;
}
