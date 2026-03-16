export interface ProcessJobInput {
  jobId: string;
  handler: (payload: Record<string, unknown>) => Promise<void>;
}
