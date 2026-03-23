export class TagCreated {
  public readonly tagId: string;
  public readonly slug: string;
  public readonly occurredAt: Date;

  constructor(
    tagId: string,
    slug: string,
    occurredAt: Date = new Date(),
  ) {
    this.tagId = tagId;
    this.slug = slug;
    this.occurredAt = occurredAt;
  }
}
