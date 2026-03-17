// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { JobPayload } from "../value-objects/job-payload.vo.js";
import { MaxAttemptsExceeded } from "../errors/max-attempts-exceeded.error.js";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export class Job {
  readonly id: string;
  readonly type: string;
  readonly payload: JobPayload;
  private _status: JobStatus;
  private _attempts: number;
  private _failureReason: string | undefined;
  readonly scheduledAt: Date;
  readonly createdAt: Date;

  get status(): JobStatus {
    return this._status;
  }

  get attempts(): number {
    return this._attempts;
  }

  get failureReason(): string | undefined {
    return this._failureReason;
  }

  private constructor(
    id: string,
    type: string,
    payload: JobPayload,
    status: JobStatus,
    attempts: number,
    scheduledAt: Date,
    createdAt: Date,
    failureReason?: string,
  ) {
    this.id = id;
    this.type = type;
    this.payload = payload;
    this._status = status;
    this._attempts = attempts;
    this.scheduledAt = scheduledAt;
    this.createdAt = createdAt;
    this._failureReason = failureReason;
  }

  static create(params: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    status?: JobStatus;
    attempts?: number;
    scheduledAt?: Date;
    createdAt?: Date;
    failureReason?: string;
  }): Result<Job, Error> {
    const payloadResult = JobPayload.create(params.payload);
    if (payloadResult.isFail()) {
      return Result.fail(payloadResult.unwrapError());
    }

    const now = new Date();
    return Result.ok(
      new Job(
        params.id,
        params.type,
        payloadResult.unwrap(),
        params.status ?? "pending",
        params.attempts ?? 0,
        params.scheduledAt ?? now,
        params.createdAt ?? now,
        params.failureReason,
      ),
    );
  }

  start(maxAttempts = 3): Result<void, MaxAttemptsExceeded | Error> {
    if (this._status !== "pending" && this._status !== "failed") {
      return Result.fail(new Error("Can only start a pending or failed job"));
    }
    if (this._attempts >= maxAttempts) {
      return Result.fail(MaxAttemptsExceeded.create(this.id, this._attempts));
    }
    this._attempts += 1;
    this._status = "processing";
    return Result.ok(undefined);
  }

  complete(): Result<void, Error> {
    if (this._status !== "processing") {
      return Result.fail(new Error("Can only complete a processing job"));
    }
    this._status = "completed";
    return Result.ok(undefined);
  }

  fail(reason: string): Result<void, Error> {
    if (this._status !== "processing") {
      return Result.fail(new Error("Can only fail a processing job"));
    }
    this._status = "failed";
    this._failureReason = reason;
    return Result.ok(undefined);
  }
}
