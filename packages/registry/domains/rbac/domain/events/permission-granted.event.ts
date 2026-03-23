export class PermissionGranted {
  public readonly roleId: string;
  public readonly permissionId: string;
  public readonly action: string;
  public readonly resource: string;
  public readonly occurredAt: Date;

  constructor(
    roleId: string,
    permissionId: string,
    action: string,
    resource: string,
    occurredAt: Date = new Date(),
  ) {
    this.roleId = roleId;
    this.permissionId = permissionId;
    this.action = action;
    this.resource = resource;
    this.occurredAt = occurredAt;
  }
}
