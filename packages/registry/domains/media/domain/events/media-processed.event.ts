export class MediaProcessed {
  public readonly mediaId: string;
  public readonly variantCount: number;
  public readonly occurredAt: Date;

  constructor(
    mediaId: string,
    variantCount: number,
    occurredAt: Date = new Date(),
  ) {
    this.mediaId = mediaId;
    this.variantCount = variantCount;
    this.occurredAt = occurredAt;
  }
}
