---
---

feat(registry): add access control bridges (auth-rbac, auth-organizations, rbac-organizations)

- auth-rbac bridge: UserRegistered → AssignRole with configurable defaultRoleId
- auth-organizations bridge: UserRegistered → CreateOrganization (personal workspace)
- rbac-organizations bridge: MemberJoined → AssignRole with org-scoped context
- RBAC capability: extend AssignRoleInput, RoleAssigned event, and repository port with optional organizationId
- Docs: bridges concept page, auth/rbac/organizations capability pages updated
- Skills: bridges.md references added for auth, rbac, and organizations skills
