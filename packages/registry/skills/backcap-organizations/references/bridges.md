# Organizations Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities via the shared event bus.

---

## `auth-organizations`

**Status**: available

**Source**: auth | **Target**: organizations

**Events**: `UserRegistered`

**Purpose**: Creates a personal organization for every newly registered user.

### Install

```bash
npx @backcap/cli add auth-organizations
```

### Directory Structure

```
bridges/auth-organizations/
  auth-organizations.bridge.ts
  bridge.json
  __tests__/
    auth-organizations.bridge.test.ts
```

### Bridge Factory

```typescript
export interface AuthOrganizationsBridgeDeps {
  createOrganization: ICreateOrganization;
}

export function createBridge(deps: AuthOrganizationsBridgeDeps): Bridge;
```

### Behavior

- On `UserRegistered`: calls `createOrganization.execute({ name: "Personal", slug: "personal-{userId}", plan: "personal", settings: {}, ownerId: event.userId })`
- Errors are caught and logged with prefix `[auth-organizations]`, never re-thrown

### Wiring

```typescript
import { createBridge } from './bridges/auth-organizations/auth-organizations.bridge.js';

const bridge = createBridge({ createOrganization: orgService.createOrganization });
bridge.wire(eventBus);
```

---

## `rbac-organizations`

**Status**: available

**Source**: organizations | **Target**: rbac

**Events**: `MemberJoined`

**Purpose**: Assigns an org-scoped default role when a member joins an organization.

### Install

```bash
npx @backcap/cli add rbac-organizations
```

### Directory Structure

```
bridges/rbac-organizations/
  rbac-organizations.bridge.ts
  bridge.json
  __tests__/
    rbac-organizations.bridge.test.ts
```

### Bridge Factory

```typescript
export interface RbacOrganizationsBridgeDeps {
  assignRole: IAssignRole;
  defaultRoleId: string;
}

export function createBridge(deps: RbacOrganizationsBridgeDeps): Bridge;
```

### Behavior

- On `MemberJoined`: calls `assignRole.execute({ userId: event.userId, roleId: deps.defaultRoleId, organizationId: event.organizationId })`
- Errors are caught and logged with prefix `[rbac-organizations]`, never re-thrown

### Wiring

```typescript
import { createBridge } from './bridges/rbac-organizations/rbac-organizations.bridge.js';

const bridge = createBridge({ assignRole: authorizationService.assignRole, defaultRoleId: 'role-member' });
bridge.wire(eventBus);
```

---

## Bridge Conventions

| Rule | Detail |
|---|---|
| Event mirroring | Bridges re-declare the minimal event shape they consume |
| Zero npm deps | No framework imports in bridge logic |
| Factory pattern | `createBridge(deps): Bridge` with `wire(eventBus)` |
| Error isolation | Catch and log, never re-throw |
| Tests co-located | `__tests__/` inside the bridge root |
