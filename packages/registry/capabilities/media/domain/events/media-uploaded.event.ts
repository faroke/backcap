export class MediaUploaded {
  public readonly mediaId: string;
  public readonly name: string;
  public readonly mimeType: string;
  public readonly size: number;
  public readonly occurredAt: Date;

  constructor(
    mediaId: string,
    name: string,
    mimeType: string,
    size: number,
    occurredAt: Date = new Date(),
  ) {
    this.mediaId = mediaId;
    this.name = name;
    this.mimeType = mimeType;
    this.size = size;
    this.occurredAt = occurredAt;
  }
}
