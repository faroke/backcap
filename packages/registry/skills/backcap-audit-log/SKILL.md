---
name: backcap-audit-log
description: Audit Log capability for Backcap — tamper-evident record of all significant actions
metadata:
  author: backcap
  version: 0.1.0
---

# Audit Log Capability

## Domain Map

```
domains/audit-log/
├── domain/
│   ├── entities/audit-entry.entity.ts       # AuditEntry — immutable, append-only aggregate
│   ├── value-objects/audit-action.vo.ts     # AuditAction — validated NOUN.VERB format
│   ├── events/entry-recorded.event.ts       # EntryRecorded — emitted on append
│   └── errors/
│       ├── invalid-audit-action.error.ts    # InvalidAuditAction
│       └── audit-query-failed.error.ts      # AuditQueryFailed
├── application/
│   ├── use-cases/
│   │   ├── record-entry.use-case.ts         # RecordEntry — append a new audit entry
│   │   └── query-audit-log.use-case.ts      # QueryAuditLog — search and filter entries
│   ├── dto/                                 # Input/Output interfaces per use case
│   └── ports/audit-store.port.ts            # IAuditStore — persistence contract (append-only)
├── contracts/
│   ├── audit-log.contract.ts                # IAuditLogService
│   ├── audit-log.factory.ts                 # createAuditLogCapability(deps)
│   └── index.ts                             # Barrel exports
└── shared/result.ts                         # Result<T, E> type
```

## Append-Only Design

Audit entries are **immutable by design**:

- `AuditEntry` has **no mutation methods** — no `update()`, no `delete()`
- `IAuditStore` exposes only `append()` and `query()` — no delete/update
- Express router has **no DELETE or PUT routes** — read-only via HTTP
- Prisma adapter only implements `append` and `query`

This ensures a tamper-evident record of all actions.

## Retention Policies

The audit log stores entries indefinitely by default. To implement retention:

1. Create a scheduled job outside the domain layer
2. Use direct database access (not the port) to archive/purge old entries
3. Consider moving entries to cold storage (S3, etc.) before deletion
4. Log the purge action itself as an audit entry

## Conventions

- All domain code is pure TypeScript — zero framework imports
- Result<T, E> for all fallible operations
- AuditAction format: `NOUN.VERB` (e.g., `USER.LOGIN`, `POST.CREATED`)
- Tests co-located in `__tests__/` directories

## Available Adapters

- **Prisma**: `adapters/prisma/audit-log/prisma-audit-store.ts` — implements IAuditStore
- **Express**: `adapters/express/audit-log/audit-log.router.ts` — REST endpoints

## Available Bridges

- **auth-audit-log** (Story 7.7): Records `USER.REGISTERED` and `USER.LOGGED_IN` on auth events

## CLI Commands

```bash
backcap add audit-log           # Install the capability
backcap bridges                 # List available bridges
```
