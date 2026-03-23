import type { IRoleRepository } from "../application/ports/role-repository.port.js";
import type { IPermissionResolver } from "../application/ports/permission-resolver.port.js";
import { CreateRole } from "../application/use-cases/create-role.use-case.js";
import { AssignRole } from "../application/use-cases/assign-role.use-case.js";
import { RevokeRole } from "../application/use-cases/revoke-role.use-case.js";
import { CheckPermission } from "../application/use-cases/check-permission.use-case.js";
import { ListRoles } from "../application/use-cases/list-roles.use-case.js";
import { GetUserPermissions } from "../application/use-cases/get-user-permissions.use-case.js";
import type { IAuthorizationService } from "./rbac.contract.js";

export type AuthorizationServiceDeps = {
  roleRepository: IRoleRepository;
  permissionResolver: IPermissionResolver;
};

export function createAuthorizationService(
  deps: AuthorizationServiceDeps,
): IAuthorizationService {
  const createRole = new CreateRole(deps.roleRepository);
  const assignRole = new AssignRole(deps.roleRepository);
  const revokeRole = new RevokeRole(deps.roleRepository);
  const checkPermission = new CheckPermission(deps.permissionResolver);
  const listRoles = new ListRoles(deps.roleRepository);
  const getUserPermissions = new GetUserPermissions(deps.permissionResolver);

  return {
    createRole: (input) =>
      createRole
        .execute(input)
        .then((result) => result.map(({ roleId }) => ({ roleId }))),
    assignRole: (input) => assignRole.execute(input),
    revokeRole: (input) => revokeRole.execute(input),
    checkPermission: (input) => checkPermission.execute(input),
    listRoles: () =>
      listRoles.execute().then((result) =>
        result.map((roles) =>
          roles.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            permissions: r.permissions.map((p) => ({
              action: p.action.value,
              resource: p.resource.value,
              conditions: p.conditions,
            })),
          })),
        ),
      ),
    getUserPermissions: (userId, organizationId) =>
      getUserPermissions.execute({ userId, organizationId }).then((result) =>
        result.map((perms) =>
          perms.map((p) => ({
            id: p.id,
            action: p.action.value,
            resource: p.resource.value,
            conditions: p.conditions,
          })),
        ),
      ),
  };
}
