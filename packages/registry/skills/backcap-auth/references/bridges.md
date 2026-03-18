# Auth Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities via the shared event bus.

---

## `auth-notifications`

**Status**: available

**Source**: auth | **Target**: notifications

**Events**: `UserRegistered`

**Purpose**: Listens to the `UserRegistered` domain event emitted by `RegisterUser` and sends
a welcome email via an `IEmailSender` port.

### Install

```bash
npx @backcap/cli add auth-notifications
```

### Directory Structure

```
bridges/auth-notifications/
  contracts/
    auth-notifications.contract.ts
    index.ts
  domain/events/
    user-registered.event.ts
  use-cases/
    send-welcome-email.use-case.ts
  dto/
    welcome-email.dto.ts
  errors/
    send-welcome-email.error.ts
  shared/
    result.ts
  __tests__/
    send-welcome-email.use-case.test.ts
    user-registered.event.test.ts
```

### Wiring

```typescript
import { SendWelcomeEmailUseCase } from './bridges/auth-notifications/use-cases/send-welcome-email.use-case.js';

const sendWelcomeEmail = new SendWelcomeEmailUseCase(myEmailSenderAdapter);

// In your registration handler:
const result = await authService.register({ email, password });
if (result.isOk()) {
  const { event } = result.unwrap();
  await sendWelcomeEmail.execute(event);
}
```

---

## `auth-audit-log`

**Status**: available

**Source**: auth | **Target**: audit-log

**Events**: `UserRegistered`, `LoginSucceeded`

**Purpose**: Records an immutable audit entry for every successful registration and login.

### Install

```bash
npx @backcap/cli add auth-audit-log
```

### Directory Structure

```
bridges/auth-audit-log/
  auth-audit-log.bridge.ts
  bridge.json
  __tests__/
    auth-audit-log.bridge.test.ts
```

### Bridge Factory

```typescript
import type { IEventBus } from "@backcap/shared/event-bus";
import type { Bridge } from "@backcap/shared/bridge";

export interface AuthAuditLogBridgeDeps {
  recordEntry: IRecordAuditEntry;
}

export function createBridge(deps: AuthAuditLogBridgeDeps): Bridge;
```

### Event Shapes (duck-typed)

```typescript
interface UserRegisteredEvent {
  userId: string;
  email: string;
}

interface LoginSucceededEvent {
  userId: string;
}
```

### Behavior

- On `UserRegistered`: calls `recordEntry.execute({ actor: event.userId, action: "USER.REGISTERED", resource: event.email })`
- On `LoginSucceeded`: calls `recordEntry.execute({ actor: event.userId, action: "USER.LOGIN", resource: event.userId })`
- Errors are caught and logged, never re-thrown

### Wiring

```typescript
import { createBridge } from './bridges/auth-audit-log/auth-audit-log.bridge.js';

const bridge = createBridge({ recordEntry: auditLogService.recordEntry });
bridge.wire(eventBus);
```

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
import type { IEventBus } from "@backcap/shared/event-bus";
import type { Bridge } from "@backcap/shared/bridge";

export interface AuthRbacBridgeDeps {
  assignRole: IAssignRole;
  defaultRoleId: string;
}

export function createBridge(deps: AuthRbacBridgeDeps): Bridge;
```

### Event Shapes (duck-typed)

```typescript
interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}
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
import type { IEventBus } from "@backcap/shared/event-bus";
import type { Bridge } from "@backcap/shared/bridge";

export interface AuthOrganizationsBridgeDeps {
  createOrganization: ICreateOrganization;
}

export function createBridge(deps: AuthOrganizationsBridgeDeps): Bridge;
```

### Event Shapes (duck-typed)

```typescript
interface UserRegisteredEvent {
  userId: string;
  email: string;
  occurredAt: Date;
}
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

## Bridge Conventions

| Rule | Detail |
|---|---|
| Event mirroring | Bridges re-declare the minimal event shape they consume |
| Zero npm deps | No framework imports in bridge logic |
| Factory pattern | `createBridge(deps): Bridge` with `wire(eventBus)` |
| Error isolation | Catch and log, never re-throw |
| Tests co-located | `__tests__/` inside the bridge root |
