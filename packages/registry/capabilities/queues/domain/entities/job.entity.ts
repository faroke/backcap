// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { MaxAttemptsExceeded } from "../errors/max-attempts-exceeded.error.js";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export class Job {
  readonly id: string;
  readonly queue: string;
  readonly payload: Record<string, unknown>;
  readonly status: JobStatus;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
  readonly processedAt: Date | null;

  private constructor(
    id: string,
    queue: string,
    payload: Record<string, unknown>,
    status: JobStatus,
    attempts: number,
    maxAttempts: number,
    createdAt: Date,
    processedAt: Date | null,
  ) {
    this.id = id;
    this.queue = queue;
    this.payload = payload;
    this.status = status;
    this.attempts = attempts;
    this.maxAttempts = maxAttempts;
    this.createdAt = createdAt;
    this.processedAt = processedAt;
  }

  static create(params: {
    id: string;
    queue: string;
    payload: Record<string, unknown>;
    maxAttempts?: number;
    createdAt?: Date;
  }): Result<Job, never> {
    return Result.ok(
      new Job(
        params.id,
        params.queue,
        params.payload,
        "pending",
        0,
        params.maxAttempts ?? 3,
        params.createdAt ?? new Date(),
        null,
      ),
    );
  }

  markProcessing(): Result<Job, MaxAttemptsExceeded> {
    if (this.attempts >= this.maxAttempts) {
      return Result.fail(MaxAttemptsExceeded.create(this.id, this.maxAttempts));
    }
    return Result.ok(
      new Job(
        this.id,
        this.queue,
        this.payload,
        "processing",
        this.attempts + 1,
        this.maxAttempts,
        this.createdAt,
        new Date(),
      ),
    );
  }

  markCompleted(): Job {
    return new Job(
      this.id,
      this.queue,
      this.payload,
      "completed",
      this.attempts,
      this.maxAttempts,
      this.createdAt,
      this.processedAt ?? new Date(),
    );
  }

  markFailed(): Job {
    return new Job(
      this.id,
      this.queue,
      this.payload,
      "failed",
      this.attempts,
      this.maxAttempts,
      this.createdAt,
      this.processedAt ?? new Date(),
    );
  }
}
