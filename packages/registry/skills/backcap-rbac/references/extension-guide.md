# RBAC Extension Guide

## Adding a New Permission Action

1. Add the action string to `VALID_ACTIONS` array in `domain/value-objects/permission-action.vo.ts`
2. Update any `includes()` logic if the new action has special semantics
3. Add test case in `domain/__tests__/permission-action.vo.test.ts`

## Adding a New Use Case

Example: `DeleteRole`

1. **Create DTO** at `application/dto/delete-role-input.dto.ts`
   ```typescript
   export interface DeleteRoleInput { roleId: string; }
   ```

2. **Create Use Case** at `application/use-cases/delete-role.use-case.ts`
   - Constructor-inject `IRoleRepository`
   - `execute(input): Promise<Result<void, RoleNotFound>>`
   - Check role exists, then delete

3. **Update Contract** — add `deleteRole` method to `IAuthorizationService`

4. **Update Factory** — wire `DeleteRole` in `createAuthorizationService()`

5. **Update Index** — export new types from `contracts/index.ts`

6. **Add Express Route** — add `DELETE /roles/:id` in `rbac.router.ts`

7. **Write Tests**
   - `application/__tests__/delete-role.use-case.test.ts`
   - Update `adapters/express/rbac/__tests__/rbac.router.test.ts`

## Adding Conditional Permissions

The `conditions` field on Permission supports arbitrary JSON conditions:

1. Define condition schema (e.g., `{ ownOnly: boolean }`)
2. Implement condition evaluation in a custom `IPermissionResolver`
3. The `hasPermission` method should check conditions against the request context

## Adding Role Hierarchy

To support role inheritance:

1. Add `parentRoleId?: string` to `Role.create()` params
2. Add `parentRole` relation in Prisma schema
3. Update `IPermissionResolver.getUserPermissions()` to traverse hierarchy
4. Add cycle detection to prevent circular inheritance

## Connecting RBAC to Auth

To integrate with the auth capability:

1. Create bridge at `bridges/rbac-auth/`
2. Listen for `UserRegistered` event to assign default role
3. Wire `IRoleRepository.findByUserId()` into auth token generation
4. Include role names in JWT payload via `ITokenService`
