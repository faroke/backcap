---
---

feat(registry): fix bridge event flow in access control bridges (story 8.4)

- rbac-organizations: add roleMapping to resolve event.role to RBAC roleId (fallback to defaultRoleId)
- auth-organizations: publish OrganizationCreated event on the bus after successful org creation
