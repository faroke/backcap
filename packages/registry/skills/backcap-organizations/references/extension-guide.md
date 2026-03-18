# Organizations Extension Guide

## Adding a New Use Case

1. Create DTO in `application/dto/<name>-input.dto.ts`
2. Create use case in `application/use-cases/<name>.use-case.ts`
3. Add test in `application/__tests__/<name>.use-case.test.ts`
4. Add method to `IOrganizationService` in `contracts/organizations.contract.ts`
5. Wire in `contracts/organizations.factory.ts`
6. Add route in `adapters/express/organizations/organizations.router.ts`

## Adding a New Adapter

1. Create adapter class implementing the relevant port interface
2. Place in `adapters/<adapter-type>/organizations/`
3. Add tests in `adapters/<adapter-type>/organizations/__tests__/`

## Member Roles Hierarchy

owner > admin > member > viewer

Use `MemberRole.isAtLeast(role)` to check if a role meets a minimum threshold.
