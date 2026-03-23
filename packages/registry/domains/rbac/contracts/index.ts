export type {
  IAuthorizationService,
  RbacCreateRoleInput,
  RbacAssignRoleInput,
  RbacRevokeRoleInput,
  RbacCheckPermissionInput,
  RbacRoleOutput,
  RbacPermissionOutput,
} from "./rbac.contract.js";

export { createAuthorizationService } from "./rbac.factory.js";
export type { AuthorizationServiceDeps } from "./rbac.factory.js";
