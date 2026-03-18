---
name: backcap-rbac
description: >
  Role-Based Access Control (RBAC) capability for backcap registry.
  Provides domain entities for Roles and Permissions, value objects for
  PermissionAction and ResourceType, use cases for role management and
  permission checking, Prisma adapter for persistence, and Express
  middleware for route-level authorization via requirePermission().
metadata:
  author: backcap
  version: 1.0.0
---

# RBAC Capability Skill

## Domain Map

See [references/domain-map.md](references/domain-map.md) for complete file-by-file reference.

## Entities

| Entity     | File                                 | Description                                      |
| ---------- | ------------------------------------ | ------------------------------------------------ |
| Role       | `domain/entities/role.entity.ts`     | Role aggregate with name, description, permissions |
| Permission | `domain/entities/permission.entity.ts` | Permission with action, resource, conditions     |

## Value Objects

| VO               | File                                            | Description                                    |
| ---------------- | ----------------------------------------------- | ---------------------------------------------- |
| PermissionAction | `domain/value-objects/permission-action.vo.ts`  | create, read, update, delete, manage           |
| ResourceType     | `domain/value-objects/resource-type.vo.ts`      | Typed resource identifier (kebab-case)         |

## Errors

| Error            | File                                          | Description                          |
| ---------------- | --------------------------------------------- | ------------------------------------ |
| RoleNotFound     | `domain/errors/role-not-found.error.ts`       | Role lookup failed                   |
| PermissionDenied | `domain/errors/permission-denied.error.ts`    | User lacks required permission       |
| DuplicateRole    | `domain/errors/duplicate-role.error.ts`       | Role name already exists             |

## Events

| Event             | File                                             | Description                        |
| ----------------- | ------------------------------------------------ | ---------------------------------- |
| RoleAssigned      | `domain/events/role-assigned.event.ts`           | Role assigned to a user            |
| RoleRevoked       | `domain/events/role-revoked.event.ts`            | Role revoked from a user           |
| PermissionGranted | `domain/events/permission-granted.event.ts`      | Permission added to a role         |

## Application Ports

| Port                | File                                                | Description                      |
| ------------------- | --------------------------------------------------- | -------------------------------- |
| IRoleRepository     | `application/ports/role-repository.port.ts`         | Role CRUD + user-role assignment |
| IPermissionResolver | `application/ports/permission-resolver.port.ts`     | Permission lookup for users      |

## DTOs

| DTO                      | File                                                      | Description                 |
| ------------------------ | --------------------------------------------------------- | --------------------------- |
| CreateRoleInput          | `application/dto/create-role-input.dto.ts`                | Input for role creation     |
| AssignRoleInput          | `application/dto/assign-role-input.dto.ts`                | Input for role assignment   |
| RevokeRoleInput          | `application/dto/revoke-role-input.dto.ts`                | Input for role revocation   |
| CheckPermissionInput     | `application/dto/check-permission-input.dto.ts`           | Input for permission check  |
| GetUserPermissionsInput  | `application/dto/get-user-permissions-input.dto.ts`       | Input for user permissions  |

## Use Cases

| Use Case           | File                                                        | Description                                    |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------- |
| CreateRole         | `application/use-cases/create-role.use-case.ts`             | Create role with optional permissions          |
| AssignRole         | `application/use-cases/assign-role.use-case.ts`             | Assign existing role to user                   |
| RevokeRole         | `application/use-cases/revoke-role.use-case.ts`             | Revoke role from user                          |
| CheckPermission    | `application/use-cases/check-permission.use-case.ts`        | Check if user has permission (primary use case)|
| ListRoles          | `application/use-cases/list-roles.use-case.ts`              | List all roles                                 |
| GetUserPermissions | `application/use-cases/get-user-permissions.use-case.ts`    | Get all permissions for a user                 |

## Contracts (Public Surface)

| Export                       | File                             | Description                                         |
| ---------------------------- | -------------------------------- | --------------------------------------------------- |
| IAuthorizationService        | `contracts/rbac.contract.ts`     | Public interface for RBAC operations                |
| createAuthorizationService   | `contracts/rbac.factory.ts`      | Factory wiring use cases to service interface       |
| AuthorizationServiceDeps     | `contracts/rbac.factory.ts`      | Dependency type for factory                         |

## Adapters

| Adapter                  | File                                                     | Description                              |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------- |
| PrismaRoleRepository     | `adapters/prisma/rbac/prisma-role-repository.adapter.ts` | Prisma implementation of IRoleRepository |
| rbac.schema.prisma       | `adapters/prisma/rbac/rbac.schema.prisma`                | Prisma schema fragment (Role, Permission, UserRole) |
| createRbacRouter         | `adapters/express/rbac/rbac.router.ts`                   | Express CRUD routes for roles            |
| requirePermission        | `adapters/express/rbac/rbac.middleware.ts`                | Express middleware: `requirePermission(service, 'posts', 'create')` |

## Extension Guide

See [references/extension-guide.md](references/extension-guide.md) for step-by-step instructions.

## Conventions

See [references/patterns.md](references/patterns.md) for RBAC-specific patterns.
