---
"@backcap/registry": minor
---

Cross-cutting access control: combined auth+permission middleware, tenant-aware tokens, and org-scoped permission checking (story 8.5)

- `requireAuth()` middleware in auth-rbac bridge combines token validation and permission check in one call
- Auth tokens now carry optional `organizationId` for tenant-scoped requests
- `CheckPermission` and `GetUserPermissions` use cases support org-scoped filtering
- `IAuthorizationService.getUserPermissions()` accepts optional `organizationId`
- Permission string format validated with clear 400 error on malformed input
