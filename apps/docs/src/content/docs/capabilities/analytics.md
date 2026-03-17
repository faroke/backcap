---
title: Analytics Capability
description: Event tracking, querying, and metrics aggregation — track events, query history, and compute dashboards for TypeScript backends.
---

The `analytics` capability provides **event tracking, querying, and metrics aggregation** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add analytics
```

## Domain Model

### AnalyticsEvent Entity

The `AnalyticsEvent` entity is the aggregate root. It is **immutable by design** — analytics are facts that cannot be edited.

```typescript
import { AnalyticsEvent } from "./capabilities/analytics/domain/entities/analytics-event.entity";

const result = AnalyticsEvent.create({
  id: crypto.randomUUID(),
  trackingId: "site-project-abc",
  name: "page_view",
  properties: { page: "/home" },
  userId: "user-1",
  sessionId: "session-abc",
});

if (result.isOk()) {
  const event = result.unwrap();
  console.log(event.trackingId.value, event.name, event.occurredAt);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `trackingId` | `TrackingId` | Site or project identifier value object |
| `name` | `string` | Event name (e.g., "page_view", "click") |
| `properties` | `Record<string, unknown> \| undefined` | Optional event payload |
| `userId` | `string \| undefined` | Optional end-user identifier |
| `sessionId` | `string \| undefined` | Optional session identifier |
| `occurredAt` | `Date` | Timestamp of the event |

`AnalyticsEvent.create()` returns `Result<AnalyticsEvent, InvalidTrackingId>`. The entity exposes no mutation methods.

### TrackingId Value Object

```typescript
import { TrackingId } from "./capabilities/analytics/domain/value-objects/tracking-id.vo";

const result = TrackingId.create("site-project-abc");
// Result<TrackingId, InvalidTrackingId>
```

Validates: non-empty alphanumeric string (allows hyphens) of 8–64 characters. Represents the site or project being tracked (not the end user).

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `InvalidTrackingId` | Value fails length or character validation | `Invalid tracking ID: "<value>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `EventTracked` | `TrackEvent` use case | `eventId`, `trackingId`, `name`, `occurredAt` |

## Application Layer

### Use Cases

#### TrackEvent

Records a new analytics event.

```typescript
const result = await analyticsService.trackEvent({
  trackingId: "site-project-abc",
  name: "page_view",
  properties: { page: "/home" },
  userId: "user-1",
  sessionId: "session-abc",
});
// Result<{ eventId: string; occurredAt: Date }, Error>
```

#### QueryEvents

Filters and paginates recorded events.

```typescript
const result = await analyticsService.queryEvents({
  trackingId: "site-project-abc",
  name: "page_view",
  fromDate: new Date("2026-01-01"),
  toDate: new Date("2026-12-31"),
  limit: 50,
  offset: 0,
});
// Result<{ events: Array<...>; total: number }, Error>
```

#### GetMetrics

Aggregates metrics for a tracking ID within a date range.

```typescript
const result = await analyticsService.getMetrics({
  trackingId: "site-project-abc",
  fromDate: new Date("2026-01-01"),
  toDate: new Date("2026-12-31"),
});
// Result<{ totalEvents: number; uniqueUsers: number; eventBreakdown: Array<{ name, count }> }, Error>
```

### Port Interfaces

#### IAnalyticsStore

```typescript
export interface IAnalyticsStore {
  record(event: AnalyticsEvent): Promise<void>;
  query(filters: AnalyticsFilters): Promise<{ events: AnalyticsEvent[]; total: number }>;
  aggregate(trackingId: string, fromDate: Date, toDate: Date): Promise<AnalyticsMetrics>;
}
```

The store is append-only (`record`). Aggregation is delegated to the store implementation.

## Public API (contracts/)

```typescript
import { createAnalyticsCapability, IAnalyticsService } from "./capabilities/analytics/contracts";

const analyticsService: IAnalyticsService = createAnalyticsCapability({ analyticsStore });
```

## Adapters

### analytics-prisma

```bash
npx @backcap/cli add analytics-prisma
```

### analytics-express

```bash
npx @backcap/cli add analytics-express
```

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/analytics/events` | `{ trackingId, name, properties?, userId?, sessionId? }` | `201 { eventId, occurredAt }` |
| `GET` | `/analytics/events` | `?trackingId=&name=&fromDate=&toDate=&limit=&offset=` | `200 { events, total }` |
| `GET` | `/analytics/metrics` | `?trackingId=&fromDate=&toDate=` | `200 { totalEvents, uniqueUsers, eventBreakdown }` |

## File Map

```
capabilities/analytics/
  domain/
    entities/analytics-event.entity.ts
    value-objects/tracking-id.vo.ts
    events/event-tracked.event.ts
    errors/invalid-tracking-id.error.ts
  application/
    use-cases/track-event.use-case.ts
    use-cases/query-events.use-case.ts
    use-cases/get-metrics.use-case.ts
    ports/analytics-store.port.ts
    dto/track-event.dto.ts
    dto/query-events.dto.ts
    dto/get-metrics.dto.ts
  contracts/
    analytics.contract.ts
    analytics.factory.ts
    index.ts
  shared/
    result.ts
```
