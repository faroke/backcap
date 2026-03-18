---
---

feat(registry): add organizations capability — multi-tenant workspaces and member management (story 8.2)

- Domain: Organization & Membership entities, OrgSlug & MemberRole value objects, 4 events, 4 errors
- Application: 7 use cases (CreateOrganization, InviteMember, AcceptInvitation, RemoveMember, ListMembers, GetOrganization, UpdateOrganization)
- Contracts: IOrganizationService with factory
- Adapters: Prisma (org, membership, invitation) with upsert, Express router with input validation & org-scope middleware
- Hardening: atomic org+membership creation with rollback, invitation race-condition fix, owner role invite rejection, settings 64KB limit, slug regex fix, auth guard on DELETE
- Skill: SKILL.md with domain-map and extension-guide
- Docs: capability page, sidebar entry, landing page grid
