export class FileProcessed {
  public readonly fileId: string;
  public readonly variantCount: number;
  public readonly occurredAt: Date;

  constructor(
    fileId: string,
    variantCount: number,
    occurredAt: Date = new Date(),
  ) {
    this.fileId = fileId;
    this.variantCount = variantCount;
    this.occurredAt = occurredAt;
  }
}
