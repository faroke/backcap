export class ReviewModerated {
  public readonly reviewId: string;
  public readonly moderatorId: string;
  public readonly newStatus: string;
  public readonly occurredAt: Date;

  constructor(
    reviewId: string,
    moderatorId: string,
    newStatus: string,
    occurredAt: Date = new Date(),
  ) {
    this.reviewId = reviewId;
    this.moderatorId = moderatorId;
    this.newStatus = newStatus;
    this.occurredAt = occurredAt;
  }
}
