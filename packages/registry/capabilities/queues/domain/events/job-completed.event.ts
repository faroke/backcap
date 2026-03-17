export class JobCompleted {
  public readonly jobId: string;
  public readonly type: string;
  public readonly completedAt: Date;
  public readonly occurredAt: Date;

  constructor(
    jobId: string,
    type: string,
    completedAt: Date = new Date(),
    occurredAt: Date = new Date(),
  ) {
    this.jobId = jobId;
    this.type = type;
    this.completedAt = completedAt;
    this.occurredAt = occurredAt;
  }
}
