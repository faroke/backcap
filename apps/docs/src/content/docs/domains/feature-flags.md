---
title: Feature Flags Domain
description: Toggle features per context without deploys — domain model, use cases, ports, and adapters for TypeScript backends.
---

The `feature-flags` domain provides **controlled feature rollouts** with key validation, toggle tracking, and optional contextual conditions for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add feature-flags
```

## Domain Model

### FeatureFlag Entity

The `FeatureFlag` entity is the aggregate root. It holds a validated key, an enabled/disabled state, and an optional conditions field for future rule engine integration.

```typescript
import { FeatureFlag } from "./domains/feature-flags/domain/entities/feature-flag.entity";

const result = FeatureFlag.create({
  id: crypto.randomUUID(),
  key: "dark-mode",
  isEnabled: false,
  conditions: { percentage: 25, segment: "beta-users" },
});

if (result.isOk()) {
  const flag = result.unwrap();
  console.log(flag.key.value); // "dark-mode"
  console.log(flag.isEnabled); // false

  const { flag: enabled, event } = flag.enable();
  console.log(enabled.isEnabled); // true
  console.log(event.key); // "dark-mode"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `key` | `FlagKey` | Validated lowercase key (2–64 chars) |
| `isEnabled` | `boolean` | Whether the flag is currently on |
| `conditions` | `Record<string, unknown> \| undefined` | Optional contextual rules (opaque to domain) |
| `createdAt` | `Date` | Timestamp of creation |

`FeatureFlag.create()` returns `Result<FeatureFlag, InvalidFlagKey>`. Invalid keys are rejected at creation time.

### FlagKey Value Object

Validates that keys are lowercase, start with a letter, use only letters/digits/underscores/hyphens, and are 2–64 characters long.

```typescript
import { FlagKey } from "./domains/feature-flags/domain/value-objects/flag-key.vo";

const key = FlagKey.create("dark-mode"); // Ok
const bad = FlagKey.create("INVALID!");  // Fail
```

### Domain Events

| Event | Fields | Emitted when |
|---|---|---|
| `FlagToggled` | `flagId`, `key`, `isEnabled`, `occurredAt` | A flag is enabled or disabled |

### Domain Errors

| Error | Factory | When |
|---|---|---|
| `FlagNotFound` | `create(key)` | Flag lookup by key returns nothing |
| `InvalidFlagKey` | `create(reason)` | Key format validation fails |
| `FlagAlreadyExists` | `create(key)` | A flag with the given key already exists (thrown by `CreateFlag`) |
| `FlagAlreadyInState` | `create(key, state)` | Toggle to current state (thrown by `ToggleFlag` use case, not domain methods) |

## Use Cases

### EvaluateFlag

Check whether a feature flag is enabled.

```typescript
const evaluateFlag = new EvaluateFlag(flagStore);
const result = await evaluateFlag.execute({ key: "dark-mode" });
// Result<{ isEnabled: boolean; key: string }, FlagNotFound>
```

### CreateFlag

Register a new feature flag.

```typescript
const createFlag = new CreateFlag(flagStore);
const result = await createFlag.execute({
  key: "dark-mode",
  isEnabled: false,
  conditions: { percentage: 50 },
});
// Result<{ flagId: string; createdAt: Date }, Error>
```

### ToggleFlag

Switch a flag on or off.

```typescript
const toggleFlag = new ToggleFlag(flagStore);
const result = await toggleFlag.execute({ key: "dark-mode", enabled: true });
// Result<{ key: string; isEnabled: boolean; updatedAt: Date }, FlagNotFound | FlagAlreadyInState>
```

## Ports

### IFlagStore

```typescript
interface IFlagStore {
  save(flag: FeatureFlag): Promise<void>;
  findByKey(key: string): Promise<FeatureFlag | null>;
  findAll(): Promise<FeatureFlag[]>;
}
```

## Adapters

### Prisma

`PrismaFlagStore` implements `IFlagStore` with a `FeatureFlagRecord` model.

### Express

`createFeatureFlagsRouter(service, router)` exposes:

| Method | Route | Status | Description |
|---|---|---|---|
| `GET` | `/flags/:key/evaluate` | 200 / 404 | Evaluate a flag (optional `context` query param as JSON) |
| `POST` | `/flags` | 201 / 400 | Create a new flag |
| `PUT` | `/flags/:key/toggle` | 200 / 404 / 409 | Toggle a flag on/off |

## Extending Conditions

The `conditions` field is `Record<string, unknown>` by design — opaque to the domain core. To add percentage rollout or user segmentation, create a condition evaluator outside the domain layer that receives `conditions` and `context` from the evaluate input.
