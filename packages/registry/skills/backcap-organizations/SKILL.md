---
name: backcap-organizations
description: >
  Organizations (multi-tenant) capability for backcap registry.
  Provides domain entities for Organizations and Memberships, value objects for
  OrgSlug and MemberRole, use cases for organization lifecycle and member
  management, Prisma adapters for persistence, and Express adapter with
  org-scoped routes and middleware.
metadata:
  author: backcap
  version: 1.0.0
---

# Organizations Capability Skill

## Domain Map

See [references/domain-map.md](references/domain-map.md) for complete file-by-file reference.

## Entities

| Entity       | File                                     | Description                                           |
| ------------ | ---------------------------------------- | ----------------------------------------------------- |
| Organization | `domain/entities/organization.entity.ts` | Organization with name, slug, plan, settings          |
| Membership   | `domain/entities/membership.entity.ts`   | Membership linking user to org with role and joinedAt |

## Value Objects

| VO         | File                                        | Description                                  |
| ---------- | ------------------------------------------- | -------------------------------------------- |
| OrgSlug    | `domain/value-objects/org-slug.vo.ts`       | Validated slug (3-63 chars, lowercase, hyphens) |
| MemberRole | `domain/value-objects/member-role.vo.ts`    | owner, admin, member, viewer                 |

## Errors

| Error              | File                                              | Description                           |
| ------------------ | ------------------------------------------------- | ------------------------------------- |
| OrgNotFound        | `domain/errors/org-not-found.error.ts`            | Organization lookup failed            |
| OrgSlugTaken       | `domain/errors/org-slug-taken.error.ts`           | Slug already in use                   |
| MemberAlreadyExists| `domain/errors/member-already-exists.error.ts`    | User already a member of org          |
| CannotRemoveOwner  | `domain/errors/cannot-remove-owner.error.ts`      | Cannot remove org owner               |

## Events

| Event              | File                                                | Description                          |
| ------------------ | --------------------------------------------------- | ------------------------------------ |
| OrganizationCreated| `domain/events/organization-created.event.ts`       | New organization created             |
| MemberInvited      | `domain/events/member-invited.event.ts`             | Member invited to organization       |
| MemberJoined       | `domain/events/member-joined.event.ts`              | Member accepted invitation           |
| MemberRemoved      | `domain/events/member-removed.event.ts`             | Member removed from organization     |

## Application Ports

| Port                   | File                                                       | Description                         |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------- |
| IOrganizationRepository| `application/ports/organization-repository.port.ts`        | Organization CRUD                   |
| IMembershipRepository  | `application/ports/membership-repository.port.ts`          | Membership CRUD + queries           |
| IInvitationService     | `application/ports/invitation-service.port.ts`             | Invitation create, find, accept     |

## DTOs

| DTO                       | File                                                           | Description                   |
| ------------------------- | -------------------------------------------------------------- | ----------------------------- |
| CreateOrganizationInput   | `application/dto/create-organization-input.dto.ts`             | Input for org creation        |
| InviteMemberInput         | `application/dto/invite-member-input.dto.ts`                   | Input for member invitation   |
| AcceptInvitationInput     | `application/dto/accept-invitation-input.dto.ts`               | Input for accepting invite    |
| RemoveMemberInput         | `application/dto/remove-member-input.dto.ts`                   | Input for member removal      |
| UpdateOrganizationInput   | `application/dto/update-organization-input.dto.ts`             | Input for org update          |

## Use Cases

| Use Case           | File                                                              | Description                                   |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------- |
| CreateOrganization | `application/use-cases/create-organization.use-case.ts`           | Create org + owner membership                 |
| InviteMember       | `application/use-cases/invite-member.use-case.ts`                 | Send invitation to join org                   |
| AcceptInvitation   | `application/use-cases/accept-invitation.use-case.ts`             | Accept invitation, create membership          |
| RemoveMember       | `application/use-cases/remove-member.use-case.ts`                 | Remove member (cannot remove owner)           |
| ListMembers        | `application/use-cases/list-members.use-case.ts`                  | List all members of an org                    |
| GetOrganization    | `application/use-cases/get-organization.use-case.ts`              | Get org by ID                                 |
| UpdateOrganization | `application/use-cases/update-organization.use-case.ts`           | Update org name/settings                      |

## Contracts (Public Surface)

| Export                     | File                                   | Description                                          |
| -------------------------- | -------------------------------------- | ---------------------------------------------------- |
| IOrganizationService       | `contracts/organizations.contract.ts`  | Public interface for organization operations         |
| createOrganizationService  | `contracts/organizations.factory.ts`   | Factory wiring use cases to service interface        |
| OrganizationServiceDeps    | `contracts/organizations.factory.ts`   | Dependency type for factory                          |

## Adapters

| Adapter                      | File                                                                    | Description                                    |
| ---------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| PrismaOrganizationRepository | `adapters/prisma/organizations/organization-repository.adapter.ts`      | Prisma implementation of IOrganizationRepository |
| PrismaMembershipRepository   | `adapters/prisma/organizations/membership-repository.adapter.ts`        | Prisma implementation of IMembershipRepository  |
| PrismaInvitationService      | `adapters/prisma/organizations/invitation-service.adapter.ts`           | Prisma implementation of IInvitationService     |
| createOrganizationsRouter    | `adapters/express/organizations/organizations.router.ts`                | Express CRUD routes for organizations           |
| createOrgScopeMiddleware     | `adapters/express/organizations/organizations.middleware.ts`             | Express middleware: org-scoped request context  |

## Extension Guide

See [references/extension-guide.md](references/extension-guide.md) for step-by-step instructions.
