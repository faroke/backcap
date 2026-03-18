---
title: RBAC Capability
description: Role-based access control for TypeScript backends — roles, permissions, assignment, and authorization checks.
---

The `rbac` capability provides **role-based access control (RBAC)** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add rbac
```

## Domain Model

### Role Entity

The `Role` entity is the aggregate root of the RBAC capability. It holds the role's identity, name, description, and a list of permissions.

```typescript
import { Role } from "./capabilities/rbac/domain/entities/role.entity";
import { Permission } from "./capabilities/rbac/domain/entities/permission.entity";

const perm = Permission.create({
  id: crypto.randomUUID(),
  action: "read",
  resource: "posts",
}).unwrap();

const result = Role.create({
  id: crypto.randomUUID(),
  name: "editor",
  description: "Can read and edit posts",
  permissions: [perm],
});

if (result.isOk()) {
  const role = result.unwrap();
  console.log(role.name, role.permissions.length);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Role name (must not be empty) |
| `description` | `string` | Human-readable description |
| `permissions` | `Permission[]` | List of granted permissions |
| `createdAt` | `Date` | Set on creation |
| `updatedAt` | `Date` | Set on creation, updated on mutation |

`Role.create()` returns `Result<Role, InvalidRoleName>`. If the name is empty, the result is a failure.

`role.addPermission(perm)` and `role.removePermission(id)` return new `Role` instances (immutable).

### Permission Entity

```typescript
import { Permission } from "./capabilities/rbac/domain/entities/permission.entity";

const result = Permission.create({
  id: crypto.randomUUID(),
  action: "manage",
  resource: "posts",
  conditions: { ownOnly: true },
});
// Result<Permission, Error>
```

`permission.matches(action, resource)` checks if a permission covers the given action and resource. The `manage` action acts as a wildcard and matches all other actions.

### PermissionAction Value Object

Valid actions: `create`, `read`, `update`, `delete`, `manage`.

- `manage` includes all other actions.
- `action.includes(other)` checks containment.
- `action.equals(other)` compares values.

### ResourceType Value Object

Validates resource names against `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`. Examples: `posts`, `user-profiles`, `audit-logs`.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `InvalidRoleName` | Role name is empty | `Invalid role name: "<name>". Role name cannot be empty` |
| `DuplicateRole` | Role name already exists | `Role already exists with name: "<name>"` |
| `RoleNotFound` | No role found for the given ID | `Role not found with id: "<id>"` |
| `PermissionDenied` | Invalid action or resource | `Permission denied: invalid action "<value>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `RoleAssigned` | `AssignRole` use case | `userId`, `roleId`, `organizationId?`, `occurredAt` |
| `RoleRevoked` | `RevokeRole` use case | `userId`, `roleId`, `occurredAt` |
| `PermissionGranted` | `CreateRole` use case | `roleId`, `permissionId`, `action`, `resource`, `occurredAt` |

## Application Layer

### Use Cases

#### CreateRole

Creates a new role with optional permissions. Emits `PermissionGranted` events for each permission.

```typescript
import { CreateRole } from "./capabilities/rbac/application/use-cases/create-role.use-case";

const createRole = new CreateRole(roleRepository);

const result = await createRole.execute({
  name: "editor",
  description: "Can edit posts",
  permissions: [
    { action: "read", resource: "posts" },
    { action: "update", resource: "posts" },
  ],
});
// Result<{ roleId: string; events: PermissionGranted[] }, Error>
```

**Possible failures**: `DuplicateRole`, `InvalidRoleName`, `PermissionDenied`

#### AssignRole

Assigns a role to a user.

```typescript
import { AssignRole } from "./capabilities/rbac/application/use-cases/assign-role.use-case";

const assignRole = new AssignRole(roleRepository);
const result = await assignRole.execute({ userId: "user-1", roleId: "role-1", organizationId: "org-1" });
// Result<{ event: RoleAssigned }, Error>
```

**Possible failures**: `RoleNotFound`

#### RevokeRole

Revokes a role from a user. Verifies the user actually has the role before revoking.

```typescript
import { RevokeRole } from "./capabilities/rbac/application/use-cases/revoke-role.use-case";

const revokeRole = new RevokeRole(roleRepository);
const result = await revokeRole.execute({ userId: "user-1", roleId: "role-1" });
// Result<{ event: RoleRevoked }, Error>
```

**Possible failures**: `RoleNotFound`

#### CheckPermission

Checks if a user has a specific permission.

```typescript
import { CheckPermission } from "./capabilities/rbac/application/use-cases/check-permission.use-case";

const checkPermission = new CheckPermission(permissionResolver);
const result = await checkPermission.execute({
  userId: "user-1",
  action: "update",
  resource: "posts",
});
// Result<{ allowed: boolean }, Error>
```

**Possible failures**: `PermissionDenied` (invalid action or resource)

#### ListRoles

Returns all roles in the system.

#### GetUserPermissions

Returns all permissions for a given user.

### Port Interfaces

#### IRoleRepository

```typescript
export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findByUserId(userId: string): Promise<Role[]>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  assignToUser(userId: string, roleId: string, organizationId?: string): Promise<void>;
  revokeFromUser(userId: string, roleId: string): Promise<void>;
}
```

#### IPermissionResolver

```typescript
export interface IPermissionResolver {
  getUserPermissions(userId: string): Promise<Permission[]>;
  hasPermission(userId: string, action: string, resource: string): Promise<boolean>;
}
```

## Public API (contracts/)

```typescript
import {
  createAuthorizationService,
  IAuthorizationService,
} from "./capabilities/rbac/contracts";

const authorizationService: IAuthorizationService = createAuthorizationService({
  roleRepository,
  permissionResolver,
});

// IAuthorizationService interface:
// createRole(input): Promise<Result<{ roleId: string }, Error>>
// assignRole(input): Promise<Result<{ event: RoleAssigned }, Error>>
// revokeRole(input): Promise<Result<{ event: RoleRevoked }, Error>>
// checkPermission(input): Promise<Result<{ allowed: boolean }, Error>>
// listRoles(): Promise<Result<RoleDTO[], Error>>
// getUserPermissions(userId): Promise<Result<PermissionDTO[], Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## Adapters

### rbac-prisma

Provides `PrismaRoleRepository` which implements `IRoleRepository`.

```bash
npx @backcap/cli add rbac-prisma
```

```typescript
import { PrismaRoleRepository } from "./adapters/prisma/rbac/prisma-role-repository.adapter";

const roleRepository = new PrismaRoleRepository(prisma);
```

Requires a Prisma schema with `Role`, `Permission`, and `UserRole` models:

```prisma
model Role {
  id          String       @id
  name        String       @unique
  description String
  permissions Permission[]
  userRoles   UserRole[]
  createdAt   DateTime
  updatedAt   DateTime
}

model Permission {
  id         String   @id
  action     String
  resource   String
  conditions Json     @default("{}")
  roleId     String
  role       Role     @relation(fields: [roleId], references: [id])
  createdAt  DateTime
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, roleId])
}
```

### rbac-express

Provides `createRbacRouter()` and a `requirePermission` middleware.

```bash
npx @backcap/cli add rbac-express
```

```typescript
import { createRbacRouter } from "./adapters/express/rbac/rbac.router";
import { requirePermission } from "./adapters/express/rbac/rbac.middleware";

const router = express.Router();
createRbacRouter(authorizationService, router);
app.use(router);

// Protect routes with permission checks
app.get("/admin/posts", requirePermission(authorizationService, "posts", "manage"), handler);
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/roles` | `{ name, description, permissions? }` | `201 { roleId }` or error |
| `GET` | `/roles` | — | `200 [{ id, name, description, permissions }]` |
| `POST` | `/roles/assign` | `{ userId, roleId }` | `200` or error |
| `POST` | `/roles/revoke` | `{ userId, roleId }` | `200` or error |

## Bridges

### auth-rbac

Assigns a default role to newly registered users. When `UserRegistered` fires, the bridge calls `AssignRole` with a configurable `defaultRoleId`.

```bash
npx @backcap/cli add auth-rbac
```

**Requires**: auth, rbac

### rbac-organizations

Assigns an org-scoped default role when a member joins an organization. When `MemberJoined` fires, the bridge calls `AssignRole` with the `organizationId` from the event.

```bash
npx @backcap/cli add rbac-organizations
```

**Requires**: rbac, organizations

## File Map

```
capabilities/rbac/
  domain/
    entities/role.entity.ts
    entities/permission.entity.ts
    value-objects/permission-action.vo.ts
    value-objects/resource-type.vo.ts
    errors/invalid-role-name.error.ts
    errors/duplicate-role.error.ts
    errors/role-not-found.error.ts
    errors/permission-denied.error.ts
    events/role-assigned.event.ts
    events/role-revoked.event.ts
    events/permission-granted.event.ts
  application/
    use-cases/create-role.use-case.ts
    use-cases/assign-role.use-case.ts
    use-cases/revoke-role.use-case.ts
    use-cases/check-permission.use-case.ts
    use-cases/list-roles.use-case.ts
    use-cases/get-user-permissions.use-case.ts
    ports/role-repository.port.ts
    ports/permission-resolver.port.ts
    dto/create-role-input.dto.ts
    dto/assign-role-input.dto.ts
    dto/revoke-role-input.dto.ts
    dto/check-permission-input.dto.ts
    dto/get-user-permissions-input.dto.ts
  contracts/
    rbac.contract.ts
    rbac.factory.ts
    index.ts
  shared/
    result.ts
```
