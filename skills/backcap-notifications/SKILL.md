---
name: backcap-notifications
description: >
  Backcap notifications capability: DDD-structured multi-channel notification delivery for
  TypeScript backends. Domain layer contains Notification entity with status transitions
  (markSent, markFailed), NotificationChannel value object (email/sms/push), NotificationSent
  event, and three typed errors (NotificationNotFound, InvalidChannel,
  NotificationDeliveryFailed). Application layer has SendNotification, GetNotifications, and
  MarkAsRead use cases, plus INotificationSender and INotificationRepository port interfaces.
  Public surface is INotificationsService and createNotificationsService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Adapters: notifications-express
  (router), notifications-prisma (PrismaNotificationRepository). Zero npm dependencies in domain
  and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-notifications

The `notifications` capability provides **multi-channel notification delivery** (email, SMS,
push) for TypeScript backends. It is structured in strict Clean Architecture layers and has zero
npm dependencies in the domain and application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

See [`references/domain-map.md`](references/domain-map.md) for a full file-by-file reference.

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/notification.entity.ts` | `Notification` | Aggregate root. Holds `id`, `channel: NotificationChannel`, `recipient`, `subject`, `body`, `status` (pending/sent/failed), `sentAt`. Private constructor; factory via `Notification.create(params)` returning `Result<Notification, InvalidChannel>`. Methods: `markSent()`, `markFailed()`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/notification-channel.vo.ts` | `NotificationChannel` | Wraps union `"email" \| "sms" \| "push"`. `NotificationChannel.create(value)` returns `Result<NotificationChannel, InvalidChannel>`. Helper methods: `isEmail()`, `isSms()`, `isPush()`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/notification-not-found.error.ts` | `NotificationNotFound` | `Notification not found with id: "<id>"` |
| `domain/errors/invalid-channel.error.ts` | `InvalidChannel` | `Invalid notification channel: "<value>"` |
| `domain/errors/notification-delivery-failed.error.ts` | `NotificationDeliveryFailed` | `Notification delivery failed: "<reason>"` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/notification-sent.event.ts` | `NotificationSent` | `notificationId: string`, `channel: string`, `recipient: string`, `sentAt: Date`, `occurredAt: Date` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/notification-sender.port.ts` | `INotificationSender` | `send(notification)` |
| `application/ports/notification-repository.port.ts` | `INotificationRepository` | `save(notification)`, `findById(notificationId)`, `findByRecipient(recipient)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/send-notification.dto.ts` | `SendNotificationInput` | `channel`, `recipient`, `subject`, `body` |
| `application/dto/send-notification.dto.ts` | `SendNotificationOutput` | `notificationId` |
| `application/dto/get-notifications.dto.ts` | `GetNotificationsInput` | `recipient` |
| `application/dto/get-notifications.dto.ts` | `GetNotificationsOutput` | `notifications[]` |
| `application/dto/mark-as-read.dto.ts` | `MarkAsReadInput` | `notificationId` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/send-notification.use-case.ts` | `SendNotification` | `Result<{ output: SendNotificationOutput; event: NotificationSent }, Error>` |
| `application/use-cases/get-notifications.use-case.ts` | `GetNotifications` | `Result<GetNotificationsOutput, Error>` |
| `application/use-cases/mark-as-read.use-case.ts` | `MarkAsRead` | `Result<void, NotificationNotFound>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/notifications.contract.ts` | `INotificationsService`, DTOs | The only public interface consumers depend on |
| `contracts/notifications.factory.ts` | `createNotificationsService(deps: NotificationsServiceDeps): INotificationsService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

### Adapters

| File | Export | Implements |
|---|---|---|
| `adapters/express/notifications/notifications.router.ts` | `createNotificationsRouter(notificationsService, router)` | `POST /notifications` → 201; `GET /notifications` → 200; `PUT /notifications/:id/read` → 200 / 404 |
| `adapters/prisma/notifications/prisma-notification-repository.ts` | `PrismaNotificationRepository` | `INotificationRepository` backed by Prisma |
| `adapters/prisma/notifications/notifications.schema.prisma` | — | Prisma `NotificationRecord` model fragment to merge into `schema.prisma` |

## Channel Provider Swap Guide

To replace the notification sender with a custom provider:

1. Create a new class implementing `INotificationSender` from `application/ports/notification-sender.port.ts`
2. Implement the `send(notification)` method — dispatch via your email/SMS/push service
3. Pass your implementation to `createNotificationsService({ notificationSender: yourSender, notificationRepository })`

Adding a new channel:
1. Update the `ChannelType` union in `domain/value-objects/notification-channel.vo.ts`
2. Update `VALID_CHANNELS` array
3. Implement channel-specific logic in your `INotificationSender` adapter

## Available Bridges

| Bridge | Description | Install |
|---|---|---|
| `auth-notifications` | Sends a welcome email when a user registers | `npx @backcap/cli add bridge auth-notifications` |

## CLI Commands

| Command | Description |
|---|---|
| `npx @backcap/cli add notifications` | Install the notifications capability (prompts for adapter selection) |
| `npx @backcap/cli add notifications --yes` | Non-interactive install; auto-selects detected adapters |
