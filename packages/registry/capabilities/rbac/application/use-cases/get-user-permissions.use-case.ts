import { Result } from "../../shared/result.js";
import type { Permission } from "../../domain/entities/permission.entity.js";
import type { IPermissionResolver } from "../ports/permission-resolver.port.js";
import type { GetUserPermissionsInput } from "../dto/get-user-permissions-input.dto.js";

export class GetUserPermissions {
  constructor(private readonly permissionResolver: IPermissionResolver) {}

  async execute(
    input: GetUserPermissionsInput,
  ): Promise<Result<Permission[], Error>> {
    const permissions = await this.permissionResolver.getUserPermissions(
      input.userId,
    );
    return Result.ok(permissions);
  }
}
