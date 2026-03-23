import type { Result } from "../shared/result.js";
import type { Job } from "../domain/entities/job.entity.js";
import type { JobPayload } from "../domain/value-objects/job-payload.vo.js";
import type { IJobRepository } from "../application/ports/job-repository.port.js";

export type { Job, JobPayload, IJobRepository };

export interface QueuesEnqueueInput {
  type: string;
  payload: Record<string, unknown>;
  scheduledAt?: Date;
}

export interface QueuesEnqueueOutput {
  jobId: string;
  scheduledAt: Date;
}

export interface QueuesProcessInput {
  jobId: string;
}

export interface QueuesProcessOutput {
  status: "completed" | "failed";
  completedAt: Date | null;
}

export interface QueuesGetStatusInput {
  jobId: string;
}

export interface QueuesGetStatusOutput {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  attempts: number;
  scheduledAt: Date;
  createdAt: Date;
  failureReason?: string;
}

export interface IQueuesService {
  enqueue(input: QueuesEnqueueInput): Promise<Result<QueuesEnqueueOutput, Error>>;
  process(input: QueuesProcessInput): Promise<Result<QueuesProcessOutput, Error>>;
  getStatus(input: QueuesGetStatusInput): Promise<Result<QueuesGetStatusOutput, Error>>;
}
