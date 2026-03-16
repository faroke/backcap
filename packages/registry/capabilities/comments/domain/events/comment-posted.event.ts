export class CommentPosted {
  public readonly commentId: string;
  public readonly authorId: string;
  public readonly resourceId: string;
  public readonly resourceType: string;
  public readonly occurredAt: Date;

  constructor(
    commentId: string,
    authorId: string,
    resourceId: string,
    resourceType: string,
    occurredAt: Date = new Date(),
  ) {
    this.commentId = commentId;
    this.authorId = authorId;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.occurredAt = occurredAt;
  }
}
