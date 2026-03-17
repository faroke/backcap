# Notifications Capability — Domain Map

Complete file-by-file reference for the `notifications` capability.

## Domain Layer

### `domain/entities/notification.entity.ts`

- **Export**: `Notification`, `NotificationStatus`
- **Type**: Entity (Aggregate Root)
- **Properties**: `id` (string), `channel` (NotificationChannel), `recipient` (string), `subject` (string), `body` (string), `status` (NotificationStatus), `sentAt` (Date | null)
- **Factory**: `Notification.create(params)` → `Result<Notification, InvalidChannel>`
- **Methods**: `markSent()` → new Notification with status "sent", `markFailed()` → new Notification with status "failed"

### `domain/value-objects/notification-channel.vo.ts`

- **Export**: `NotificationChannel`, `ChannelType`
- **Type**: Value Object
- **Property**: `value` (readonly ChannelType: "email" | "sms" | "push")
- **Factory**: `NotificationChannel.create(value)` → `Result<NotificationChannel, InvalidChannel>`
- **Helpers**: `isEmail()`, `isSms()`, `isPush()`

### `domain/events/notification-sent.event.ts`

- **Export**: `NotificationSent`
- **Type**: Domain Event
- **Properties**: `notificationId`, `channel`, `recipient`, `sentAt`, `occurredAt` (defaults to `new Date()`)

### `domain/errors/`

| File | Class | Factory |
|---|---|---|
| `notification-not-found.error.ts` | `NotificationNotFound extends Error` | `static create(id: string)` |
| `invalid-channel.error.ts` | `InvalidChannel extends Error` | `static create(value: string)` |
| `notification-delivery-failed.error.ts` | `NotificationDeliveryFailed extends Error` | `static create(reason: string)` |

## Application Layer

### `application/ports/`

| File | Interface | Methods |
|---|---|---|
| `notification-sender.port.ts` | `INotificationSender` | `send(notification: Notification): Promise<void>` |
| `notification-repository.port.ts` | `INotificationRepository` | `save(notification)`, `findById(notificationId)`, `findByRecipient(recipient)` |

### `application/dto/`

| File | Interfaces |
|---|---|
| `send-notification.dto.ts` | `SendNotificationInput` (channel, recipient, subject, body), `SendNotificationOutput` (notificationId) |
| `get-notifications.dto.ts` | `GetNotificationsInput` (recipient), `GetNotificationsOutput` (notifications[]) |
| `mark-as-read.dto.ts` | `MarkAsReadInput` (notificationId) |

### `application/use-cases/`

| File | Class | Dependencies | Returns |
|---|---|---|---|
| `send-notification.use-case.ts` | `SendNotification` | `INotificationSender`, `INotificationRepository` | `Result<{ output, event }, Error>` |
| `get-notifications.use-case.ts` | `GetNotifications` | `INotificationRepository` | `Result<GetNotificationsOutput, Error>` |
| `mark-as-read.use-case.ts` | `MarkAsRead` | `INotificationRepository` | `Result<void, NotificationNotFound>` |

## Contracts Layer

| File | Export |
|---|---|
| `notifications.contract.ts` | `INotificationsService` interface |
| `notifications.factory.ts` | `createNotificationsService(deps)` factory |
| `index.ts` | Barrel re-exports |
