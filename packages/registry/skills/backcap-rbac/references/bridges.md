# RBAC Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities via the shared event bus.

---

## `auth-rbac`

**Status**: available

**Source**: auth | **Target**: rbac

**Events**: `UserRegistered`

**Purpose**: Assigns a default RBAC role to every newly registered user.

### Install

```bash
npx @backcap/cli add auth-rbac
```

### Directory Structure

```
bridges/auth-rbac/
  auth-rbac.bridge.ts
  bridge.json
  __tests__/
    auth-rbac.bridge.test.ts
```

### Bridge Factory

```typescript
export interface AuthRbacBridgeDeps {
  assignRole: IAssignRole;
  defaultRoleId: string;
}

export function createBridge(deps: AuthRbacBridgeDeps): Bridge;
```

### Behavior

- On `UserRegistered`: calls `assignRole.execute({ userId: event.userId, roleId: deps.defaultRoleId })`
- Errors are caught and logged with prefix `[auth-rbac]`, never re-thrown

### Wiring

```typescript
import { createBridge } from './bridges/auth-rbac/auth-rbac.bridge.js';

const bridge = createBridge({ assignRole: authorizationService.assignRole, defaultRoleId: 'role-user' });
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
  roleMapping?: Record<string, string>;
}

export function createBridge(deps: RbacOrganizationsBridgeDeps): Bridge;
```

### Behavior

- On `MemberJoined`: resolves `roleId` from `deps.roleMapping[event.role]`, falling back to `deps.defaultRoleId` if the role is not mapped or `roleMapping` is not provided
- Calls `assignRole.execute({ userId: event.userId, roleId, organizationId: event.organizationId })`
- Errors are caught and logged with prefix `[rbac-organizations]`, never re-thrown

### Wiring

```typescript
import { createBridge } from './bridges/rbac-organizations/rbac-organizations.bridge.js';

const bridge = createBridge({
  assignRole: authorizationService.assignRole,
  defaultRoleId: 'role-member',
  roleMapping: { owner: 'role-admin', admin: 'role-admin', member: 'role-member', viewer: 'role-viewer' },
});
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
