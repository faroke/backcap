---
title: Bridges
description: Cross-capability use cases that wire two or more capabilities together.
---

A **bridge** is a standalone module that connects two or more capabilities. Bridges implement cross-cutting logic that does not belong inside any single capability — for example, recording an audit entry when a user registers, or indexing a blog post for search.

Without bridges, you would have to modify the `auth` capability to import from `audit-log`, violating the principle that each capability is self-contained. Bridges solve this by living outside both capabilities, subscribing to domain events via a shared event bus, and calling use cases from the target capability.

## Anatomy of a Bridge

Each bridge lives in a directory under `bridges/` and contains:

```
bridges/auth-audit-log/
  auth-audit-log.bridge.ts   # Factory + event subscriptions
  bridge.json                # Machine-readable manifest
  __tests__/
    auth-audit-log.bridge.test.ts
```

A `bridge.json` manifest declares the bridge metadata:

```json
{
  "name": "auth-audit-log",
  "sourceCapability": "auth",
  "targetCapability": "audit-log",
  "events": ["UserRegistered", "LoginSucceeded"],
  "version": "1.0.0"
}
```

## The Bridge Factory Pattern

Every bridge exports a `createBridge(deps): Bridge` factory. The `Bridge` interface exposes a `wire(eventBus)` method that registers event subscriptions.

```typescript
// bridges/auth-audit-log/auth-audit-log.bridge.ts
import type { IEventBus } from "@backcap/shared/event-bus";
import type { Bridge } from "@backcap/shared/bridge";

export interface AuthAuditLogBridgeDeps {
  recordEntry: IRecordAuditEntry;
}

export function createBridge(deps: AuthAuditLogBridgeDeps): Bridge {
  return {
    wire(eventBus: IEventBus): void {
      eventBus.subscribe<UserRegisteredEvent>("UserRegistered", async (event) => {
        await deps.recordEntry.execute({
          actor: event.userId,
          action: "USER.REGISTERED",
          resource: event.email,
        });
      });
    },
  };
}
```

Dependencies (use case instances) are injected via the factory — the bridge never calls capability factories directly. This makes testing trivial: swap `InMemoryEventBus` and mock use cases.

## Error Isolation

A bridge handler that fails must **not** re-throw. It logs the error and continues. Bridges are fire-and-observe, not fire-and-require:

```typescript
eventBus.subscribe("UserRegistered", async (event) => {
  try {
    await deps.recordEntry.execute({ ... });
  } catch (error) {
    console.error("[auth-audit-log] Failed:", error);
  }
});
```

## Available Bridges

| Bridge | Source | Target | Events |
|---|---|---|---|
| `auth-billing` | auth | billing | UserRegistered |
| `auth-notifications` | auth | notifications | UserRegistered |
| `auth-audit-log` | auth | audit-log | UserRegistered, LoginSucceeded |
| `auth-rbac` | auth | rbac | UserRegistered |
| `auth-organizations` | auth | organizations | UserRegistered |
| `organizations-billing` | organizations | billing | OrganizationCreated |
| `rbac-organizations` | organizations | rbac | MemberJoined |
| `blog-search` | blog | search | PostPublished |
| `blog-comments` | comments | blog, notifications | CommentPosted |
| `blog-tags` | blog | tags | PostPublished |

## Discovering Bridges

Use `backcap bridges` to see which bridges exist in your project:

```bash
npx @backcap/cli bridges
```

The CLI reads `bridge.json` manifests from your local `bridges/` directory and displays:

```
Bridges

  auth-audit-log
    Source: auth | Target: audit-log
    Events: UserRegistered, LoginSucceeded | Status: installed

  blog-search
    Source: blog | Target: search
    Events: PostPublished | Status: available
```

## Installing a Bridge

```bash
npx @backcap/cli add auth-audit-log
```

## Wiring a Bridge

After installation, wire the bridge in your container:

```typescript
import { createBridge } from "./bridges/auth-audit-log/auth-audit-log.bridge.js";
import { InMemoryEventBus } from "@backcap/shared/in-memory-event-bus";

const eventBus = new InMemoryEventBus();
const bridge = createBridge({ recordEntry: auditLogService.recordEntry });
bridge.wire(eventBus);

// When auth emits events on this bus, the bridge reacts automatically
```

## Bridge vs. Capability

| | Capability | Bridge |
|---|---|---|
| Purpose | Implements a bounded context | Connects two capabilities via events |
| Location | `src/capabilities/<name>/` | `src/bridges/<name>/` |
| Dependencies | Zero external imports in domain | Imports from shared event bus + use case ports |
| Pattern | Use cases, entities, ports | Factory + `wire(eventBus)` subscriptions |
| Installed via | `backcap add <name>` | `backcap add <bridge-name>` |

## Bridge Conventions

- A bridge name uses the format `<source-cap>-<target-cap>` (e.g., `auth-audit-log`)
- A bridge must include a `bridge.json` manifest
- A bridge defines its own event shapes by duck-typing (event mirroring)
- A bridge defines its own use case port interfaces — no direct imports from capability internals
- A bridge has no knowledge of framework details — it only depends on port interfaces
- Error handling: catch and log, never re-throw
