export class MemberRemoved {
  public readonly organizationId: string;
  public readonly userId: string;
  public readonly removedBy: string;
  public readonly occurredAt: Date;

  constructor(
    organizationId: string,
    userId: string,
    removedBy: string,
    occurredAt: Date = new Date(),
  ) {
    this.organizationId = organizationId;
    this.userId = userId;
    this.removedBy = removedBy;
    this.occurredAt = occurredAt;
  }
}
