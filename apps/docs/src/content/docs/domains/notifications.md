---
title: Notifications Domain
description: Multi-channel notification delivery (email, SMS, push) for TypeScript backends — domain model, use cases, ports, and adapters.
---

The `notifications` domain provides **multi-channel notification delivery** (email, SMS, push) for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add notifications
```

## Domain Model

### Notification Entity

The `Notification` entity is the aggregate root. It tracks delivery status through immutable state transitions.

```typescript
import { Notification } from "./domains/notifications/domain/entities/notification.entity";

const result = Notification.create({
  id: crypto.randomUUID(),
  channel: "email",
  recipient: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
});

if (result.isOk()) {
  const notification = result.unwrap();
  console.log(notification.status); // "pending"

  const sent = notification.markSent();
  console.log(sent.status); // "sent"
  console.log(sent.sentAt); // Date
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `channel` | `NotificationChannel` | Delivery channel value object |
| `recipient` | `string` | Recipient address (email, phone, device ID) |
| `subject` | `string` | Notification subject |
| `body` | `string` | Notification body content |
| `status` | `"pending" \| "sent" \| "failed"` | Current delivery status |
| `sentAt` | `Date \| null` | Timestamp when sent (null if pending/failed) |

`Notification.create()` returns `Result<Notification, InvalidChannel>`.

**State transitions:**
- `markSent()` — returns a new `Notification` with status `"sent"` and `sentAt` set
- `markFailed()` — returns a new `Notification` with status `"failed"`

### NotificationChannel Value Object

```typescript
import { NotificationChannel } from "./domains/notifications/domain/value-objects/notification-channel.vo";

const result = NotificationChannel.create("email");
// Result<NotificationChannel, InvalidChannel>

if (result.isOk()) {
  const channel = result.unwrap();
  console.log(channel.value);   // "email"
  console.log(channel.isEmail()); // true
}
```

Supports: `"email"`, `"sms"`, `"push"`. Returns `InvalidChannel` for anything else.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `NotificationNotFound` | No notification for the given ID | `Notification not found with id: "<id>"` |
| `InvalidChannel` | Channel is not email/sms/push | `Invalid notification channel: "<value>"` |
| `NotificationDeliveryFailed` | Send operation failed | `Notification delivery failed: "<reason>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `NotificationSent` | `SendNotification` use case | `notificationId`, `channel`, `recipient`, `sentAt`, `occurredAt` |

## Application Layer

### Use Cases

#### SendNotification

Creates a notification, sends it via `INotificationSender`, marks it as sent or failed, and persists via `INotificationRepository`.

```typescript
import { SendNotification } from "./domains/notifications/application/use-cases/send-notification.use-case";

const sendNotification = new SendNotification(notificationSender, notificationRepository);

const result = await sendNotification.execute({
  channel: "email",
  recipient: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
});
// Result<{ output: { notificationId: string }; event: NotificationSent }, Error>
```

**Possible failures**: `InvalidChannel`, `NotificationDeliveryFailed`

#### GetNotifications

Retrieves notifications for a given recipient.

```typescript
import { GetNotifications } from "./domains/notifications/application/use-cases/get-notifications.use-case";

const getNotifications = new GetNotifications(notificationRepository);

const result = await getNotifications.execute({ recipient: "user@example.com" });
// Result<{ notifications: Notification[] }, Error>
```

#### MarkAsRead

Marks a notification as sent by transitioning its status to `"sent"` via `markSent()`. Despite its name, it sets the status to `"sent"` (not `"read"`) — there is no separate read state in the domain model.

```typescript
import { MarkAsRead } from "./domains/notifications/application/use-cases/mark-as-read.use-case";

const markAsRead = new MarkAsRead(notificationRepository);

const result = await markAsRead.execute({ notificationId: "abc-123" });
// Result<void, NotificationNotFound>
```

### Port Interfaces

#### INotificationSender

```typescript
export interface INotificationSender {
  send(notification: Notification): Promise<void>;
}
```

The sender is a thin delivery port — it dispatches via your email/SMS/push provider. It does not persist.

#### INotificationRepository

```typescript
export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(notificationId: string): Promise<Notification | null>;
  findByRecipient(recipient: string): Promise<Notification[]>;
}
```

## Public API (contracts/)

```typescript
import {
  createNotificationsService,
  INotificationsService,
} from "./domains/notifications/contracts";

const notificationsService: INotificationsService = createNotificationsService({
  notificationSender,
  notificationRepository,
});

// INotificationsService interface:
// send(input): Promise<Result<SendNotificationOutput, Error>>
// getByRecipient(input): Promise<Result<GetNotificationsOutput, Error>>
// markAsRead(input): Promise<Result<void, Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## Adapters

### notifications-prisma

Provides `PrismaNotificationRepository` which implements `INotificationRepository`.

```bash
npx @backcap/cli add notifications-prisma
```

```typescript
import { PrismaNotificationRepository } from "./adapters/prisma/notifications/prisma-notification-repository";

const notificationRepository = new PrismaNotificationRepository(prisma);
```

Requires a Prisma schema with a `NotificationRecord` model:

```prisma
model NotificationRecord {
  id        String    @id @default(uuid())
  channel   String
  recipient String
  subject   String
  body      String
  status    String    @default("pending")
  sentAt    DateTime?

  @@index([recipient])
}
```

### notifications-express

Provides `createNotificationsRouter()` for HTTP access.

```bash
npx @backcap/cli add notifications-express
```

```typescript
import { createNotificationsRouter } from "./adapters/express/notifications/notifications.router";

const router = express.Router();
createNotificationsRouter(notificationsService, router);
app.use(router);
```

**Routes added:**

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/notifications` | `{ channel, recipient, subject, body }` | `201 { notificationId }` or error |
| `GET` | `/notifications` | `?recipient=...` (required) | `200 { notifications }` or `400` |
| `PUT` | `/notifications/:id/read` | — | `200 { success }` or `404` |

**HTTP error mapping:**

| Domain Error | HTTP Status |
|---|---|
| `NotificationNotFound` | `404 Not Found` |
| `InvalidChannel` | `400 Bad Request` |

## Bridges

### auth-notifications

Sends a welcome email when a new user registers.

```bash
npx @backcap/cli add auth-notifications
```

See the [auth-notifications bridge](/backcap/concepts/bridges#the-auth-notifications-bridge) documentation for wiring instructions.

## File Map

```
domains/notifications/
  domain/
    entities/notification.entity.ts
    value-objects/notification-channel.vo.ts
    errors/notification-not-found.error.ts
    errors/invalid-channel.error.ts
    errors/notification-delivery-failed.error.ts
    events/notification-sent.event.ts
  application/
    use-cases/send-notification.use-case.ts
    use-cases/get-notifications.use-case.ts
    use-cases/mark-as-read.use-case.ts
    ports/notification-sender.port.ts
    ports/notification-repository.port.ts
    dto/send-notification.dto.ts
    dto/get-notifications.dto.ts
    dto/mark-as-read.dto.ts
  contracts/
    notifications.contract.ts
    notifications.factory.ts
    index.ts
  shared/
    result.ts
```
