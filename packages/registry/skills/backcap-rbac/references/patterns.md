# RBAC Patterns

## Permission Resolution

- `manage` action acts as a wildcard — grants all CRUD operations on the resource
- Permission matching checks both action inclusion and resource equality
- The `IPermissionResolver` port aggregates permissions across all user roles

## Role Hierarchy

- Roles are flat — no inheritance between roles
- A user can have multiple roles assigned simultaneously
- Effective permissions are the union of all role permissions
- `manage` on a resource is equivalent to having all CRUD actions

## Result Pattern in RBAC

- `CheckPermission` returns `Result<boolean, PermissionDenied>` — not a plain boolean
- When denied, the error includes userId, action, and resource for debugging
- All expected failures use `Result.fail()`, never throw from use cases

## Express Middleware Pattern

```typescript
// Usage: requirePermission(authorizationService, 'posts', 'create')
router.post('/posts', requirePermission(service, 'posts', 'create'), createPostHandler);
```

- Middleware checks `req.user` first (401 if missing)
- Delegates to `IAuthorizationService.checkPermission`
- Returns 403 with error message if denied
- Calls `next()` only on success

## Domain Event Pattern

- `RoleAssigned` and `RoleRevoked` are returned in `Result.ok({ event })` payloads
- Calling layer decides how to dispatch events (e.g., to bridges)
- Events never auto-dispatched from use cases

## Immutable Entities

- `Role.addPermission()` and `Role.removePermission()` return new Role instances
- Original entity is never mutated
- All entity fields are `readonly`

## DI Wiring Pattern

- `createAuthorizationService(deps)` is the only place for concrete instantiation
- Adapters call factory once at startup
- Pass `IRoleRepository` and `IPermissionResolver` implementations

## Mock Pattern for Tests

- `InMemoryRoleRepository` uses `Map<string, Role>` for storage + `Map<string, Set<string>>` for user-role assignments
- `InMemoryPermissionResolver` uses `Map<string, Permission[]>` with explicit `setPermissions()` method
- Mocks live in `application/__tests__/mocks/`

## Fixture Pattern

- `createTestRole(overrides?)` and `createTestPermission(overrides?)` in `application/__tests__/fixtures/role.fixture.ts`
- Use `unwrap()` in fixtures (trusted test data)
- Override any field via partial parameter
