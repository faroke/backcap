export class MediaDeleted {
  public readonly mediaId: string;
  public readonly occurredAt: Date;

  constructor(
    mediaId: string,
    occurredAt: Date = new Date(),
  ) {
    this.mediaId = mediaId;
    this.occurredAt = occurredAt;
  }
}
