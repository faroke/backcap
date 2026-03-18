export class RoleAssigned {
  public readonly userId: string;
  public readonly roleId: string;
  public readonly organizationId?: string;
  public readonly occurredAt: Date;

  constructor(userId: string, roleId: string, organizationId?: string, occurredAt: Date = new Date()) {
    this.userId = userId;
    this.roleId = roleId;
    this.organizationId = organizationId;
    this.occurredAt = occurredAt;
  }
}
