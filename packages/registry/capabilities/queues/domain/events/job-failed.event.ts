export class JobFailed {
  public readonly jobId: string;
  public readonly queue: string;
  public readonly reason: string;
  public readonly occurredAt: Date;

  constructor(
    jobId: string,
    queue: string,
    reason: string,
    occurredAt: Date = new Date(),
  ) {
    this.jobId = jobId;
    this.queue = queue;
    this.reason = reason;
    this.occurredAt = occurredAt;
  }
}
