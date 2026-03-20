# RBAC Domain Map

## Directory Tree

```
domains/rbac/
├── domain/
│   ├── entities/
│   │   ├── role.entity.ts          # Role aggregate root
│   │   └── permission.entity.ts    # Permission entity
│   ├── value-objects/
│   │   ├── permission-action.vo.ts # create|read|update|delete|manage
│   │   └── resource-type.vo.ts     # Typed resource identifier
│   ├── events/
│   │   ├── role-assigned.event.ts
│   │   ├── role-revoked.event.ts
│   │   └── permission-granted.event.ts
│   ├── errors/
│   │   ├── role-not-found.error.ts
│   │   ├── permission-denied.error.ts
│   │   └── duplicate-role.error.ts
│   └── __tests__/
│       ├── role.entity.test.ts
│       ├── permission.entity.test.ts
│       ├── permission-action.vo.test.ts
│       ├── resource-type.vo.test.ts
│       ├── events.test.ts
│       └── errors.test.ts
├── application/
│   ├── ports/
│   │   ├── role-repository.port.ts
│   │   └── permission-resolver.port.ts
│   ├── dto/
│   │   ├── create-role-input.dto.ts
│   │   ├── assign-role-input.dto.ts
│   │   ├── revoke-role-input.dto.ts
│   │   ├── check-permission-input.dto.ts
│   │   └── get-user-permissions-input.dto.ts
│   ├── use-cases/
│   │   ├── create-role.use-case.ts
│   │   ├── assign-role.use-case.ts
│   │   ├── revoke-role.use-case.ts
│   │   ├── check-permission.use-case.ts
│   │   ├── list-roles.use-case.ts
│   │   └── get-user-permissions.use-case.ts
│   └── __tests__/
│       ├── mocks/
│       │   ├── role-repository.mock.ts
│       │   └── permission-resolver.mock.ts
│       ├── fixtures/
│       │   └── role.fixture.ts
│       ├── create-role.use-case.test.ts
│       ├── assign-role.use-case.test.ts
│       ├── revoke-role.use-case.test.ts
│       ├── check-permission.use-case.test.ts
│       ├── list-roles.use-case.test.ts
│       └── get-user-permissions.use-case.test.ts
├── contracts/
│   ├── rbac.contract.ts
│   ├── rbac.factory.ts
│   └── index.ts
└── shared/
    └── result.ts

adapters/
├── prisma/rbac/
│   ├── rbac.schema.prisma
│   ├── prisma-role-repository.adapter.ts
│   └── __tests__/
│       └── prisma-role-repository.adapter.test.ts
└── express/rbac/
    ├── rbac.router.ts
    ├── rbac.middleware.ts
    └── __tests__/
        ├── rbac.router.test.ts
        └── rbac.middleware.test.ts
```

## Domain Layer

### Role (Aggregate Root)

- **File:** `domain/entities/role.entity.ts`
- **Responsibility:** Represents a named role with a collection of permissions
- **Key Methods:**
  - `static create(params): Result<Role, DuplicateRole>` — validates name is non-empty
  - `addPermission(permission): Role` — returns new Role with added permission (immutable)
  - `removePermission(permissionId): Role` — returns new Role without permission (immutable)

### Permission

- **File:** `domain/entities/permission.entity.ts`
- **Responsibility:** Represents a single permission (action + resource + conditions)
- **Key Methods:**
  - `static create(params): Result<Permission, PermissionDenied>` — validates action and resource VOs
  - `matches(action, resource): boolean` — checks if this permission covers the given action/resource

### PermissionAction VO

- **File:** `domain/value-objects/permission-action.vo.ts`
- **Valid values:** `create`, `read`, `update`, `delete`, `manage`
- **Key Methods:**
  - `equals(other): boolean` — value equality
  - `includes(other): boolean` — `manage` includes all actions

### ResourceType VO

- **File:** `domain/value-objects/resource-type.vo.ts`
- **Validation:** kebab-case, starts with letter, lowercase
- **Key Methods:** `equals(other): boolean`

## Application Layer

### IRoleRepository Port

- **File:** `application/ports/role-repository.port.ts`
- **Methods:** `findById`, `findByName`, `findByUserId`, `save`, `delete`, `findAll`, `assignToUser`, `revokeFromUser`

### IPermissionResolver Port

- **File:** `application/ports/permission-resolver.port.ts`
- **Methods:** `getUserPermissions(userId)`, `hasPermission(userId, action, resource)`

### CheckPermission (Primary Use Case)

- **File:** `application/use-cases/check-permission.use-case.ts`
- **Signature:** `execute(input): Promise<Result<boolean, PermissionDenied>>`
- **Logic:** Validates action/resource VOs, delegates to IPermissionResolver

## Contracts Layer

### IAuthorizationService

- **File:** `contracts/rbac.contract.ts`
- **Methods:** `createRole`, `assignRole`, `revokeRole`, `checkPermission`, `listRoles`, `getUserPermissions`

### createAuthorizationService

- **File:** `contracts/rbac.factory.ts`
- **Deps:** `{ roleRepository: IRoleRepository; permissionResolver: IPermissionResolver }`
- **Wires:** All six use cases into the IAuthorizationService interface
