export class PostCreated {
  public readonly postId: string;
  public readonly authorId: string;
  public readonly occurredAt: Date;

  constructor(postId: string, authorId: string, occurredAt: Date = new Date()) {
    this.postId = postId;
    this.authorId = authorId;
    this.occurredAt = occurredAt;
  }
}
