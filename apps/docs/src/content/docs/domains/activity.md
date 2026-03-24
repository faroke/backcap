---
title: Activity Domain
description: Track user activities and generate feeds and timelines — record who did what to which resource, with actor and action validation.
---

The `activity` domain provides **activity tracking, feeds, and timelines**. It records who did what to which resource, enabling social-style activity feeds and audit-like timelines.

## Install

```bash
npx @backcap/cli add activity
```

## Domain Model

### ActivityEntry Entity

Each activity entry captures an actor, an action, a target resource, and optional metadata.

```typescript
import { ActivityEntry } from "./domains/activity/domain/entities/activity-entry.entity";

const entry = ActivityEntry.create({
  id: crypto.randomUUID(),
  actorId: "user-1",
  actorDisplayName: "Jane Doe",
  action: "commented",
  targetId: "post-42",
  targetType: "post",
  metadata: { commentId: "c-99" },
  occurredAt: new Date(),
});
```

### Value Objects

- **`Actor`** — validated user reference (id + display name)
- **`Action`** — validated action string

## Use Cases

| Use Case | Description |
|----------|-------------|
| `Record` | Log a new activity event |
| `GetFeed` | Retrieve the activity feed for a user |
| `GetTimeline` | Get chronological timeline of activities for a resource |

## Ports

- **`IActivityRepository`** — `save`, `findByActor`, `findByTarget`

## Contract & Factory

```typescript
import { createActivityService } from "./domains/activity/contracts";

const activity = createActivityService({
  activityRepository: myActivityRepo,
});

await activity.record({
  actorId: "user-1",
  actorDisplayName: "Jane Doe",
  action: "commented",
  targetId: "post-42",
  targetType: "post",
});
```

## Domain Events

| Event | Payload |
|-------|---------|
| `ActivityRecorded` | actorId, action, targetId, targetType |
