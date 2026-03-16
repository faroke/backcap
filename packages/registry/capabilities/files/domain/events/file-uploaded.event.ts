export class FileUploaded {
  public readonly fileId: string;
  public readonly name: string;
  public readonly mimeType: string;
  public readonly size: number;
  public readonly occurredAt: Date;

  constructor(
    fileId: string,
    name: string,
    mimeType: string,
    size: number,
    occurredAt: Date = new Date(),
  ) {
    this.fileId = fileId;
    this.name = name;
    this.mimeType = mimeType;
    this.size = size;
    this.occurredAt = occurredAt;
  }
}
