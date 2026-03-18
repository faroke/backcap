---
title: Organizations Capability
description: Multi-tenant organizations for TypeScript backends — workspace isolation, member management, invitations, and role-based membership.
---

The `organizations` capability provides **multi-tenant workspace isolation** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add organizations
```

## Domain Model

### Organization Entity

The `Organization` entity is the aggregate root. It holds the org's identity, name, slug, plan, and settings.

```typescript
import { Organization } from "./capabilities/organizations/domain/entities/organization.entity";

const result = Organization.create({
  id: crypto.randomUUID(),
  name: "My Team",
  slug: "my-team",
  plan: "pro",
  settings: { maxMembers: 50 },
});

if (result.isOk()) {
  const org = result.unwrap();
  console.log(org.name, org.slug.value, org.plan);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Organization name (required, trimmed) |
| `slug` | `OrgSlug` | Validated URL-safe slug |
| `plan` | `string` | Subscription plan (default: `"free"`) |
| `settings` | `Record<string, unknown>` | Custom settings (default: `{}`), max 64KB serialized |
| `createdAt` | `Date` | Set on creation |
| `updatedAt` | `Date` | Set on creation, updated on mutation |

`Organization.create()` returns `Result<Organization, Error>`. Fails if name is empty or slug is invalid.

`org.updateName(name)` returns `Result<Organization, Error>`. `org.updateSettings(settings)` returns `Result<Organization, Error>` and rejects settings exceeding 64KB serialized size. Both return new instances (immutable).

### Membership Entity

```typescript
import { Membership } from "./capabilities/organizations/domain/entities/membership.entity";

const result = Membership.create({
  id: crypto.randomUUID(),
  userId: "user-1",
  organizationId: "org-1",
  role: "admin",
});
// Result<Membership, Error>
```

`membership.changeRole(newRole)` returns a new `Membership` instance with the updated role.

### OrgSlug Value Object

Validates slugs: 3-63 characters, lowercase alphanumeric + hyphens, no leading/trailing hyphens.

```typescript
import { OrgSlug } from "./capabilities/organizations/domain/value-objects/org-slug.vo";

const result = OrgSlug.create("my-team");
// Result<OrgSlug, Error>
```

### MemberRole Value Object

Valid roles: `owner`, `admin`, `member`, `viewer`.

- `role.isOwner()` checks if the role is owner.
- `role.isAtLeast(role)` checks hierarchy: owner > admin > member > viewer.
- `role.equals(other)` compares values.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `OrgNotFound` | Organization lookup failed | `Organization not found with id: "<id>"` |
| `OrgSlugTaken` | Slug already in use | `Organization slug already taken: "<slug>"` |
| `MemberAlreadyExists` | User already a member | `User "<userId>" is already a member of organization "<orgId>"` |
| `CannotRemoveOwner` | Attempt to remove owner | `Cannot remove the owner of organization "<orgId>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `OrganizationCreated` | `CreateOrganization` use case | `organizationId`, `name`, `slug`, `ownerId`, `occurredAt` |
| `MemberInvited` | `InviteMember` use case | `organizationId`, `invitedEmail`, `role`, `invitedBy`, `occurredAt` |
| `MemberJoined` | `AcceptInvitation` use case | `organizationId`, `userId`, `role`, `occurredAt` |
| `MemberRemoved` | `RemoveMember` use case | `organizationId`, `userId`, `removedBy`, `occurredAt` |

## Application Layer

### Use Cases

#### CreateOrganization

Creates a new organization and an owner membership for the creator.

```typescript
import { CreateOrganization } from "./capabilities/organizations/application/use-cases/create-organization.use-case";

const createOrg = new CreateOrganization(organizationRepository, membershipRepository);

const result = await createOrg.execute({
  name: "My Team",
  slug: "my-team",
  ownerId: "user-1",
  plan: "pro",
});
// Result<{ organizationId: string; event: OrganizationCreated }, Error>
```

**Possible failures**: `OrgSlugTaken`, invalid name or slug

#### InviteMember

Invites a user to join an organization by email.

```typescript
const result = await inviteMember.execute({
  organizationId: "org-1",
  email: "invite@example.com",
  role: "member",
  invitedBy: "user-1",
});
// Result<{ invitationId: string; event: MemberInvited }, Error>
```

**Possible failures**: `OrgNotFound`, invalid role, owner role not allowed

#### AcceptInvitation

Accepts a pending invitation and creates the membership.

```typescript
const result = await acceptInvitation.execute({
  token: "invitation-token",
  userId: "user-2",
});
// Result<{ membershipId: string; event: MemberJoined }, Error>
```

**Possible failures**: Invalid/expired token, `MemberAlreadyExists`

#### RemoveMember

Removes a member from an organization. Cannot remove the owner.

**Possible failures**: `OrgNotFound`, `CannotRemoveOwner`, user not a member

#### ListMembers

Returns all members of an organization.

#### GetOrganization

Returns an organization by ID.

#### UpdateOrganization

Updates an organization's name and/or settings.

### Port Interfaces

#### IOrganizationRepository

```typescript
export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  save(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### IMembershipRepository

```typescript
export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null>;
  findByOrganization(organizationId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### IInvitationService

```typescript
export interface IInvitationService {
  create(params: { organizationId: string; email: string; role: string; invitedBy: string }): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  markAccepted(id: string): Promise<void>;
}
```

## Public API (contracts/)

```typescript
import {
  createOrganizationService,
  IOrganizationService,
} from "./capabilities/organizations/contracts";

const orgService: IOrganizationService = createOrganizationService({
  organizationRepository,
  membershipRepository,
  invitationService,
});

// IOrganizationService interface:
// createOrganization(input): Promise<Result<{ organizationId: string }, Error>>
// getOrganization(id): Promise<Result<OrgOutput, Error>>
// updateOrganization(input): Promise<Result<OrgOutput, Error>>
// inviteMember(input): Promise<Result<{ invitationId: string }, Error>>
// acceptInvitation(input): Promise<Result<{ membershipId: string }, Error>>
// removeMember(input): Promise<Result<void, Error>>
// listMembers(orgId): Promise<Result<OrgMemberOutput[], Error>>
```

## Adapters

### organizations-prisma

Provides `PrismaOrganizationRepository`, `PrismaMembershipRepository`, and `PrismaInvitationService`.

```bash
npx @backcap/cli add organizations-prisma
```

```typescript
import { PrismaOrganizationRepository } from "./adapters/prisma/organizations/organization-repository.adapter";
import { PrismaMembershipRepository } from "./adapters/prisma/organizations/membership-repository.adapter";
import { PrismaInvitationService } from "./adapters/prisma/organizations/invitation-service.adapter";

const organizationRepository = new PrismaOrganizationRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const invitationService = new PrismaInvitationService(prisma);
```

### organizations-express

Provides `createOrganizationsRouter()` and `createOrgScopeMiddleware()`.

```bash
npx @backcap/cli add organizations-express
```

```typescript
import { createOrganizationsRouter } from "./adapters/express/organizations/organizations.router";
import { createOrgScopeMiddleware } from "./adapters/express/organizations/organizations.middleware";

const router = express.Router();
createOrganizationsRouter(orgService, router);
app.use(router);

// Scope routes to an organization
app.use("/orgs/:orgId/*", createOrgScopeMiddleware(orgService));
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/organizations` | `{ name, slug, ownerId, plan?, settings? }` | `201 { organizationId }` |
| `GET` | `/organizations/:id` | — | `200 OrgOutput` |
| `PUT` | `/organizations/:id` | `{ name?, settings? }` | `200 OrgOutput` |
| `POST` | `/organizations/:id/invitations` | `{ email, role, invitedBy }` | `201 { invitationId }` |
| `POST` | `/invitations/accept` | `{ token, userId }` | `200 { membershipId }` |
| `GET` | `/organizations/:id/members` | — | `200 OrgMemberOutput[]` |
| `DELETE` | `/organizations/:orgId/members/:userId` | — | `204` |

## Bridges

### auth-organizations

Creates a personal organization for newly registered users. When `UserRegistered` fires, the bridge calls `CreateOrganization` with a personal workspace scoped to the user.

```bash
npx @backcap/cli add auth-organizations
```

**Requires**: auth, organizations

### rbac-organizations

Assigns an org-scoped default role when a member joins an organization. When `MemberJoined` fires, the bridge calls `AssignRole` with the `organizationId` from the event.

```bash
npx @backcap/cli add rbac-organizations
```

**Requires**: rbac, organizations

## File Map

```
capabilities/organizations/
  domain/
    entities/organization.entity.ts
    entities/membership.entity.ts
    value-objects/org-slug.vo.ts
    value-objects/member-role.vo.ts
    errors/org-not-found.error.ts
    errors/org-slug-taken.error.ts
    errors/member-already-exists.error.ts
    errors/cannot-remove-owner.error.ts
    events/organization-created.event.ts
    events/member-invited.event.ts
    events/member-joined.event.ts
    events/member-removed.event.ts
  application/
    use-cases/create-organization.use-case.ts
    use-cases/invite-member.use-case.ts
    use-cases/accept-invitation.use-case.ts
    use-cases/remove-member.use-case.ts
    use-cases/list-members.use-case.ts
    use-cases/get-organization.use-case.ts
    use-cases/update-organization.use-case.ts
    ports/organization-repository.port.ts
    ports/membership-repository.port.ts
    ports/invitation-service.port.ts
    dto/create-organization-input.dto.ts
    dto/invite-member-input.dto.ts
    dto/accept-invitation-input.dto.ts
    dto/remove-member-input.dto.ts
    dto/update-organization-input.dto.ts
  contracts/
    organizations.contract.ts
    organizations.factory.ts
    index.ts
  shared/
    result.ts
```
