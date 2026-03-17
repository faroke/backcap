---
name: backcap-analytics
description: Analytics capability for Backcap — track events, query history, and aggregate metrics
metadata:
  author: backcap
  version: 0.1.0
---

# Analytics Capability

## Domain Map

```
capabilities/analytics/
├── domain/
│   ├── entities/analytics-event.entity.ts    # AnalyticsEvent — immutable event aggregate
│   ├── value-objects/tracking-id.vo.ts       # TrackingId — validated site/project identifier (8-64 chars)
│   ├── events/event-tracked.event.ts         # EventTracked — emitted when an event is recorded
│   └── errors/
│       └── invalid-tracking-id.error.ts      # InvalidTrackingId
├── application/
│   ├── use-cases/
│   │   ├── track-event.use-case.ts           # TrackEvent — record a new analytics event
│   │   ├── query-events.use-case.ts          # QueryEvents — filter and paginate events
│   │   └── get-metrics.use-case.ts           # GetMetrics — aggregate metrics for a tracking ID
│   ├── dto/                                  # Input/Output interfaces per use case
│   └── ports/analytics-store.port.ts         # IAnalyticsStore — persistence + aggregation contract
├── contracts/
│   ├── analytics.contract.ts                 # IAnalyticsService
│   ├── analytics.factory.ts                  # createAnalyticsCapability(deps)
│   └── index.ts                              # Barrel exports
└── shared/result.ts                          # Result<T, E> type
```

## Extension Guide

### Adding a New Metric Type

To add a custom metric (e.g., conversion funnel):

1. Add the metric fields to `GetMetricsOutput` in `get-metrics.dto.ts`
2. Extend `AnalyticsMetrics` interface in `analytics-store.port.ts`
3. Update `IAnalyticsStore.aggregate()` to compute the new metric
4. Update the Prisma adapter's `aggregate()` implementation with the necessary query
5. The domain layer remains unchanged — aggregation is delegated to the store

### Adding Event Validation Rules

To validate event names or properties:

1. Create a new value object (e.g., `EventName`) in `domain/value-objects/`
2. Add validation logic in the VO's `create()` factory
3. Update `AnalyticsEvent.create()` to use the new VO
4. Update tests accordingly

## Conventions

- All domain code is pure TypeScript — zero framework imports
- `AnalyticsEvent` is immutable by design (analytics are facts)
- `IAnalyticsStore.record()` is append-only
- Aggregation is delegated to `IAnalyticsStore.aggregate()` — not in use case logic
- Result<T, E> for all fallible operations
- Private constructors + static `.create()` factories

## Available Adapters

- **Prisma**: `adapters/prisma/analytics/prisma-analytics-store.ts` — implements IAnalyticsStore
- **Express**: `adapters/express/analytics/analytics.router.ts` — REST endpoints (POST/GET events, GET metrics)

## CLI Commands

```bash
backcap add analytics       # Install the capability
backcap bridges             # List available bridges
```
