---
name: backcap-activity
description: Activity domain for Backcap — domain-first clean architecture for activity tracking, feeds, and timelines. Records actor/action/target events as immutable ActivityEntry records, persists them through the vendor-independent IActivityStore port, and exposes them as a global feed or a per-actor timeline with filtering (actor, action, target, date range) and pagination. Emits an ActivityRecorded domain event on each write. Use when building audit-style activity streams, "what happened" feeds, user timelines, or notification source events.
metadata:
  author: backcap
  version: 0.1.0
---

# Activity Domain

## Domain Map

```
domains/activity/
├── domain/
│   ├── entities/
│   │   └── activity-entry.entity.ts   → ActivityEntry (id, actor, action, targetId, targetName, metadata, occurredAt; derived `summary`)
│   ├── value-objects/
│   │   ├── actor.vo.ts                → Actor (id, displayName; non-empty validation)
│   │   └── action.vo.ts              → Action (lowercase kebab-case verb, regex-validated)
│   ├── events/
│   │   └── activity-recorded.event.ts → ActivityRecorded (emitted when an entry is recorded)
│   ├── errors/
│   │   ├── invalid-actor.error.ts     → InvalidActor
│   │   ├── invalid-action.error.ts    → InvalidAction
│   │   ├── invalid-target.error.ts    → InvalidTarget
│   │   └── query-failed.error.ts      → QueryFailed
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── record-activity.use-case.ts → RecordActivity (creates entry, appends to store, returns event)
│   │   ├── get-feed.use-case.ts        → GetFeed (global filtered/paginated feed)
│   │   └── get-timeline.use-case.ts    → GetTimeline (per-actor filtered/paginated timeline)
│   ├── ports/
│   │   └── activity-store.port.ts      → IActivityStore (append, query), ActivityFilters
│   ├── dto/
│   │   ├── record-activity.dto.ts       → RecordActivityInput / RecordActivityOutput
│   │   ├── get-feed.dto.ts              → GetFeedInput / GetFeedOutput
│   │   ├── get-timeline.dto.ts          → GetTimelineInput / GetTimelineOutput
│   │   └── activity-entry-output.dto.ts → ActivityEntryOutput
│   └── __tests__/
├── contracts/
│   ├── activity.contract.ts → IActivityService
│   ├── activity.factory.ts  → createActivityService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Actor / Action / Target model**: Every activity is an `actor` (who) performing an `action` (verb) on a target (`targetId` + `targetName`). The entity exposes a derived `summary` string (`"<actor> <action> <target>"`) so consumers get a human-readable line for free.
- **Action as a validated VO**: Actions are constrained to lowercase kebab-case verbs (e.g. `invited`, `uploaded-file`) via regex, keeping feeds consistent and queryable; invalid input returns `InvalidAction` rather than throwing.
- **Feeds vs. timelines**: `GetFeed` serves a global activity stream while `GetTimeline` scopes to a single actor (required `actorId`). Both share the same `ActivityFilters` (action, target, date range, limit/offset) and `ActivityEntryOutput` shape.
- **Vendor-independent persistence**: The domain knows nothing about storage — it depends only on the `IActivityStore` port (`append` / `query`). Query failures are surfaced as the typed `QueryFailed` error.
- **Typed Result everywhere**: Use cases and the service contract return `Result<T, E>` with exact error unions (`InvalidActor | InvalidAction | InvalidTarget` for recording, `QueryFailed` for reads) and immutable entities, so callers handle failures explicitly without exceptions.
- **Event emission**: Recording an activity produces an `ActivityRecorded` event alongside the output, letting downstream consumers (notifications, projections) react without coupling to the write path.
