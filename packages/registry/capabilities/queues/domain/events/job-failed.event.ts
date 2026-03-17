export class JobFailed {
  public readonly jobId: string;
  public readonly type: string;
  public readonly reason: string;
  public readonly attempts: number;
  public readonly occurredAt: Date;

  constructor(
    jobId: string,
    type: string,
    reason: string,
    attempts: number,
    occurredAt: Date = new Date(),
  ) {
    this.jobId = jobId;
    this.type = type;
    this.reason = reason;
    this.attempts = attempts;
    this.occurredAt = occurredAt;
  }
}
