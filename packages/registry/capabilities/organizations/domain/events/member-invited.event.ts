export class MemberInvited {
  public readonly organizationId: string;
  public readonly invitedEmail: string;
  public readonly role: string;
  public readonly invitedBy: string;
  public readonly occurredAt: Date;

  constructor(
    organizationId: string,
    invitedEmail: string,
    role: string,
    invitedBy: string,
    occurredAt: Date = new Date(),
  ) {
    this.organizationId = organizationId;
    this.invitedEmail = invitedEmail;
    this.role = role;
    this.invitedBy = invitedBy;
    this.occurredAt = occurredAt;
  }
}
