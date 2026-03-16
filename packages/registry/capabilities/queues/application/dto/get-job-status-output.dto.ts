export interface GetJobStatusOutput {
  id: string;
  queue: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt: Date | null;
}
