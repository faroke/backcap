---
---

feat(registry): add RBAC capability — role-based access control

- Domain: Role & Permission entities, PermissionAction & ResourceType value objects, 3 events, 4 errors
- Application: 6 use cases (CreateRole, AssignRole, RevokeRole, CheckPermission, ListRoles, GetUserPermissions)
- Contracts: IAuthorizationService with factory
- Adapters: Prisma role repository, Express router & requirePermission middleware
- Skill: SKILL.md with domain-map, patterns and extension-guide
- Docs: capability page, sidebar entry, landing page grid
