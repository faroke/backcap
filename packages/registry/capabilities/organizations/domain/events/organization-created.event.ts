export class OrganizationCreated {
  public readonly organizationId: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly ownerId: string;
  public readonly occurredAt: Date;

  constructor(
    organizationId: string,
    name: string,
    slug: string,
    ownerId: string,
    occurredAt: Date = new Date(),
  ) {
    this.organizationId = organizationId;
    this.name = name;
    this.slug = slug;
    this.ownerId = ownerId;
    this.occurredAt = occurredAt;
  }
}
