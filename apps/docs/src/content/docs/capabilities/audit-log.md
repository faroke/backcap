---
title: Audit Log Capability
description: Tamper-evident activity tracking with append-only design, filtering, and pagination for TypeScript backends.
---

The `audit-log` capability provides a **tamper-evident record of all significant actions** with validated action formats, rich filtering, and pagination for TypeScript backends. It enforces append-only design at every layer — domain, port, adapter, and HTTP.

## Install

```bash
npx @backcap/cli add audit-log
```

## Domain Model

### AuditEntry Entity

The `AuditEntry` entity is immutable by design. It has no mutation methods — audit entries are append-only.

```typescript
import { AuditEntry } from "./capabilities/audit-log/domain/entities/audit-entry.entity";

const result = AuditEntry.create({
  id: crypto.randomUUID(),
  actor: "user-123",
  action: "USER.LOGIN",
  resource: "auth/session",
  metadata: { ip: "192.168.1.1" },
});

if (result.isOk()) {
  const entry = result.unwrap();
  console.log(entry.actor);        // "user-123"
  console.log(entry.action.value); // "USER.LOGIN"
  console.log(entry.resource);     // "auth/session"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `actor` | `string` | Who performed the action |
| `action` | `AuditAction` | Validated NOUN.VERB format |
| `resource` | `string` | What was acted upon |
| `metadata` | `Record<string, unknown> \| undefined` | Optional contextual data |
| `timestamp` | `Date` | When the action occurred |

`AuditEntry.create()` returns `Result<AuditEntry, InvalidAuditAction>`.

### AuditAction Value Object

Validates that actions follow the `NOUN.VERB` format — uppercase, dot-separated (e.g., `USER.LOGIN`, `POST.CREATED`, `FLAG.TOGGLED`).

```typescript
import { AuditAction } from "./capabilities/audit-log/domain/value-objects/audit-action.vo";

const action = AuditAction.create("USER.LOGIN");   // Ok
const bad = AuditAction.create("user.login");       // Fail (lowercase)
const bad2 = AuditAction.create("LOGIN");           // Fail (no dot)
```

### Domain Events

| Event | Fields | Emitted when |
|---|---|---|
| `EntryRecorded` | `entryId`, `actor`, `action`, `resource`, `occurredAt` | A new audit entry is appended |

### Domain Errors

| Error | Factory | When |
|---|---|---|
| `InvalidAuditAction` | `create(value)` | Action format validation fails |
| `AuditQueryFailed` | `create(reason)` | Query execution fails |

## Use Cases

### RecordEntry

Append a new audit entry.

```typescript
const recordEntry = new RecordEntry(auditStore);
const result = await recordEntry.execute({
  actor: "user-123",
  action: "USER.LOGIN",
  resource: "auth/session",
  metadata: { ip: "192.168.1.1" },
});
// Result<{ output: RecordEntryOutput; event: EntryRecorded }, Error>
```

### QueryAuditLog

Search and filter audit entries.

```typescript
const queryAuditLog = new QueryAuditLog(auditStore);
const result = await queryAuditLog.execute({
  actor: "user-123",
  fromDate: new Date("2024-01-01"),
  limit: 50,
  offset: 0,
});
// Result<{ entries: QueryAuditLogEntry[]; total: number }, AuditQueryFailed>
```

## Ports

### IAuditStore

```typescript
interface IAuditStore {
  append(entry: AuditEntry): Promise<void>;
  query(filters: AuditFilters): Promise<{ entries: AuditEntry[]; total: number }>;
}
```

No `delete` or `update` methods — append-only by design.

### AuditFilters

```typescript
interface AuditFilters {
  actor?: string;
  action?: string;
  resource?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}
```

## Adapters

### Prisma

`PrismaAuditStore` implements `IAuditStore` with an `AuditEntryRecord` model. Includes composite indexes on `(actor, timestamp)`, `(action, timestamp)`, `resource`, and `timestamp` for efficient queries.

### Express

`createAuditLogRouter(service, router)` exposes:

| Method | Route | Status | Description |
|---|---|---|---|
| `POST` | `/audit` | 201 / 400 | Record a new audit entry |
| `GET` | `/audit` | 200 / 500 | Query audit entries with filters |

No `DELETE` or `PUT` routes — audit logs are read-only via HTTP.

## Bridges

### auth-audit-log

Records audit entries for authentication events. When `UserRegistered` fires, it records a `USER.REGISTERED` action. When `LoginSucceeded` fires, it records a `USER.LOGIN` action.

```bash
npx @backcap/cli add auth-audit-log
```

**Requires**: auth, audit-log

## Retention Policies

The audit log stores entries indefinitely by default. To implement retention, create a scheduled job outside the domain layer using direct database access. Consider archiving entries to cold storage before purging.
