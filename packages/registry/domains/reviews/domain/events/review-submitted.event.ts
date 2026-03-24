export class ReviewSubmitted {
  public readonly reviewId: string;
  public readonly authorId: string;
  public readonly resourceId: string;
  public readonly resourceType: string;
  public readonly rating: number;
  public readonly occurredAt: Date;

  constructor(
    reviewId: string,
    authorId: string,
    resourceId: string,
    resourceType: string,
    rating: number,
    occurredAt: Date = new Date(),
  ) {
    this.reviewId = reviewId;
    this.authorId = authorId;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.rating = rating;
    this.occurredAt = occurredAt;
  }
}
