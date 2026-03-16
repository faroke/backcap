import type { Result } from "../shared/result.js";

export interface JobEnqueueInput {
  queue: string;
  payload: Record<string, unknown>;
  priority?: string;
  maxAttempts?: number;
}

export interface JobEnqueueOutput {
  jobId: string;
}

export interface JobProcessInput {
  jobId: string;
  handler: (payload: Record<string, unknown>) => Promise<void>;
}

export interface JobProcessOutput {
  jobId: string;
  status: "completed" | "failed";
}

export interface JobStatusOutput {
  id: string;
  queue: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt: Date | null;
}

export interface IQueuesService {
  enqueue(input: JobEnqueueInput): Promise<Result<JobEnqueueOutput, Error>>;
  process(input: JobProcessInput): Promise<Result<JobProcessOutput, Error>>;
  getStatus(jobId: string): Promise<Result<JobStatusOutput, Error>>;
}
