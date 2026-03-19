export class PostPublished {
  public readonly postId: string;
  public readonly slug: string;
  public readonly publishedAt: Date;
  public readonly occurredAt: Date;

  constructor(
    postId: string,
    slug: string,
    publishedAt: Date,
    occurredAt: Date = new Date(),
  ) {
    this.postId = postId;
    this.slug = slug;
    this.publishedAt = publishedAt;
    this.occurredAt = occurredAt;
  }
}
