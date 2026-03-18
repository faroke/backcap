# Organizations Domain Map

## Capability Root

`packages/registry/capabilities/organizations/`

## File Structure

```
organizations/
├── domain/
│   ├── entities/
│   │   ├── organization.entity.ts    # Organization aggregate
│   │   └── membership.entity.ts      # Membership entity
│   ├── value-objects/
│   │   ├── org-slug.vo.ts            # Validated org slug
│   │   └── member-role.vo.ts         # Role enum (owner/admin/member/viewer)
│   ├── events/
│   │   ├── organization-created.event.ts
│   │   ├── member-invited.event.ts
│   │   ├── member-joined.event.ts
│   │   └── member-removed.event.ts
│   ├── errors/
│   │   ├── org-not-found.error.ts
│   │   ├── org-slug-taken.error.ts
│   │   ├── member-already-exists.error.ts
│   │   └── cannot-remove-owner.error.ts
│   └── __tests__/
│       ├── organization.entity.test.ts
│       ├── membership.entity.test.ts
│       ├── org-slug.vo.test.ts
│       ├── member-role.vo.test.ts
│       ├── events.test.ts
│       └── errors.test.ts
├── application/
│   ├── ports/
│   │   ├── organization-repository.port.ts
│   │   ├── membership-repository.port.ts
│   │   └── invitation-service.port.ts
│   ├── dto/
│   │   ├── create-organization-input.dto.ts
│   │   ├── invite-member-input.dto.ts
│   │   ├── accept-invitation-input.dto.ts
│   │   ├── remove-member-input.dto.ts
│   │   └── update-organization-input.dto.ts
│   ├── use-cases/
│   │   ├── create-organization.use-case.ts
│   │   ├── invite-member.use-case.ts
│   │   ├── accept-invitation.use-case.ts
│   │   ├── remove-member.use-case.ts
│   │   ├── list-members.use-case.ts
│   │   ├── get-organization.use-case.ts
│   │   └── update-organization.use-case.ts
│   └── __tests__/
│       ├── create-organization.use-case.test.ts
│       ├── invite-member.use-case.test.ts
│       ├── accept-invitation.use-case.test.ts
│       ├── remove-member.use-case.test.ts
│       ├── list-members.use-case.test.ts
│       ├── get-organization.use-case.test.ts
│       ├── update-organization.use-case.test.ts
│       ├── mocks/
│       │   ├── organization-repository.mock.ts
│       │   ├── membership-repository.mock.ts
│       │   └── invitation-service.mock.ts
│       └── fixtures/
│           ├── organization.fixture.ts
│           └── membership.fixture.ts
├── contracts/
│   ├── organizations.contract.ts
│   ├── organizations.factory.ts
│   └── index.ts
└── shared/
    └── result.ts
```

## Adapters

```
packages/registry/adapters/
├── prisma/organizations/
│   ├── organization-repository.adapter.ts
│   ├── membership-repository.adapter.ts
│   ├── invitation-service.adapter.ts
│   └── __tests__/
│       ├── organization-repository.adapter.test.ts
│       ├── membership-repository.adapter.test.ts
│       └── invitation-service.adapter.test.ts
└── express/organizations/
    ├── organizations.router.ts
    ├── organizations.middleware.ts
    └── __tests__/
        ├── organizations.router.test.ts
        └── organizations.middleware.test.ts
```
