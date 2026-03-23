export class MemberJoined {
  public readonly organizationId: string;
  public readonly userId: string;
  public readonly role: string;
  public readonly occurredAt: Date;

  constructor(
    organizationId: string,
    userId: string,
    role: string,
    occurredAt: Date = new Date(),
  ) {
    this.organizationId = organizationId;
    this.userId = userId;
    this.role = role;
    this.occurredAt = occurredAt;
  }
}
