export class RoleAssigned {
  public readonly userId: string;
  public readonly roleId: string;
  public readonly occurredAt: Date;

  constructor(userId: string, roleId: string, occurredAt: Date = new Date()) {
    this.userId = userId;
    this.roleId = roleId;
    this.occurredAt = occurredAt;
  }
}
