export class FileDeleted {
  public readonly fileId: string;
  public readonly occurredAt: Date;

  constructor(
    fileId: string,
    occurredAt: Date = new Date(),
  ) {
    this.fileId = fileId;
    this.occurredAt = occurredAt;
  }
}
