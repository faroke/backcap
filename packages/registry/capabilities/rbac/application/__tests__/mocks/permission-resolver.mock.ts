import type { Permission } from "../../../domain/entities/permission.entity.js";
import type { IPermissionResolver } from "../../ports/permission-resolver.port.js";

export class InMemoryPermissionResolver implements IPermissionResolver {
  private userPermissions = new Map<string, Permission[]>();

  setPermissions(userId: string, permissions: Permission[]): void {
    this.userPermissions.set(userId, permissions);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.userPermissions.get(userId) ?? [];
  }

  async hasPermission(
    userId: string,
    action: string,
    resource: string,
  ): Promise<boolean> {
    const permissions = this.userPermissions.get(userId) ?? [];
    return permissions.some(
      (p) =>
        (p.action.value === action || p.action.value === "manage") &&
        p.resource.value === resource,
    );
  }
}
