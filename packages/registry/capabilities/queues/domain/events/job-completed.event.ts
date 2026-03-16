export class JobCompleted {
  public readonly jobId: string;
  public readonly queue: string;
  public readonly occurredAt: Date;

  constructor(jobId: string, queue: string, occurredAt: Date = new Date()) {
    this.jobId = jobId;
    this.queue = queue;
    this.occurredAt = occurredAt;
  }
}
