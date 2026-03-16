---
title: Create a Capability
description: Numbered checklist for authoring a new Backcap capability from scratch.
---

This guide walks through creating a new capability for the Backcap registry. We'll use a hypothetical `notifications` capability as the running example. Follow the numbered checklist in order.

## Before You Start

A capability is a vertical slice of backend business logic structured in four layers: `domain/`, `application/`, `contracts/`, and an optional `adapters/` tree. Read the [Capabilities concept page](/concepts/capabilities) and the [Architecture page](/concepts/architecture) before proceeding.

## Checklist

### 1. Define the Bounded Context

Write a one-paragraph description of what the capability does and what it does **not** do. Be explicit about boundaries.

Example:
> The `notifications` capability manages the delivery of transactional messages to users. It defines the `INotificationSender` port, a `SendNotification` use case, and typed results for delivery success and failure. It does not handle email provider configuration, template rendering, or user preference management.

### 2. Create the Directory Structure

```bash
mkdir -p packages/registry/capabilities/notifications/domain/entities
mkdir -p packages/registry/capabilities/notifications/domain/value-objects
mkdir -p packages/registry/capabilities/notifications/domain/errors
mkdir -p packages/registry/capabilities/notifications/domain/events
mkdir -p packages/registry/capabilities/notifications/domain/__tests__
mkdir -p packages/registry/capabilities/notifications/application/use-cases
mkdir -p packages/registry/capabilities/notifications/application/ports
mkdir -p packages/registry/capabilities/notifications/application/dto
mkdir -p packages/registry/capabilities/notifications/application/__tests__/mocks
mkdir -p packages/registry/capabilities/notifications/contracts
mkdir -p packages/registry/capabilities/notifications/shared
```

### 3. Copy the Result Monad

Copy `shared/result.ts` from an existing capability. This file is duplicated intentionally so each capability is self-contained:

```bash
cp packages/registry/capabilities/auth/shared/result.ts \
   packages/registry/capabilities/notifications/shared/result.ts
```

### 4. Define Domain Errors

Create typed error classes for every expected failure condition. Each error extends `Error` and has a static factory method:

```typescript
// domain/errors/notification-failed.error.ts
export class NotificationFailed extends Error {
  static create(reason: string): NotificationFailed {
    return new NotificationFailed(`Notification delivery failed: ${reason}`);
  }
}
```

Rules:
- One file per error class
- File name: `<kebab-name>.error.ts`
- Export name: `PascalCase`
- No external imports

### 5. Define Value Objects (if needed)

Value objects wrap and validate primitives. Use them when a primitive carries business meaning:

```typescript
// domain/value-objects/channel.vo.ts
import { Result } from "../../shared/result.js";

const VALID_CHANNELS = ["email", "sms", "push"] as const;
type Channel = (typeof VALID_CHANNELS)[number];

export class NotificationChannel {
  private constructor(readonly value: Channel) {}

  static create(value: string): Result<NotificationChannel, Error> {
    if (!VALID_CHANNELS.includes(value as Channel)) {
      return Result.fail(new Error(`Invalid channel: ${value}`));
    }
    return Result.ok(new NotificationChannel(value as Channel));
  }
}
```

Rules:
- Private constructor — always use a static factory that returns `Result`
- Immutable — no setters
- No external imports

### 6. Define Domain Entities (if needed)

Entities are domain objects with identity. Not every capability needs entities — some are purely service-oriented.

Rules:
- Private constructor
- Factory method returns `Result<Entity, DomainError>`
- All mutation methods return `Result<Entity, DomainError>` (return a new instance)
- No external imports

### 7. Define Domain Events

Domain events represent something that happened. They are emitted by use cases and consumed by bridges:

```typescript
// domain/events/notification-sent.event.ts
export class NotificationSent {
  readonly occurredAt: Date;

  constructor(
    readonly notificationId: string,
    readonly userId: string,
    readonly channel: string,
  ) {
    this.occurredAt = new Date();
  }
}
```

### 8. Write Domain Tests

Test all domain logic before moving to the application layer:

```typescript
// domain/__tests__/channel.vo.test.ts
describe("NotificationChannel", () => {
  it("creates a valid channel", () => {
    const result = NotificationChannel.create("email");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("email");
  });

  it("rejects an invalid channel", () => {
    const result = NotificationChannel.create("carrier-pigeon");
    expect(result.isFail()).toBe(true);
  });
});
```

### 9. Define Port Interfaces

Ports describe what the use cases need from external systems. One interface per external concern:

```typescript
// application/ports/notification-sender.port.ts
import type { SendNotificationDto } from "../dto/send-notification.dto.js";

export interface INotificationSender {
  send(dto: SendNotificationDto): Promise<void>;
}
```

Rules:
- `interface` keyword (not `abstract class`)
- Filename: `<kebab-name>.port.ts`
- Export name: `I<PascalName>`
- Import from `domain/` only (for entity types if needed)

### 10. Define DTOs

DTOs are plain data shapes for use case inputs and outputs. No methods, no validation logic:

```typescript
// application/dto/send-notification.dto.ts
export interface SendNotificationDto {
  userId: string;
  channel: string;
  subject: string;
  body: string;
}
```

### 11. Implement Use Cases

One class per use case, one public `execute()` method:

```typescript
// application/use-cases/send-notification.use-case.ts
import { Result } from "../../shared/result.js";
import { NotificationFailed } from "../../domain/errors/notification-failed.error.js";
import type { INotificationSender } from "../ports/notification-sender.port.js";
import type { SendNotificationDto } from "../dto/send-notification.dto.js";

export class SendNotification {
  constructor(private readonly sender: INotificationSender) {}

  async execute(dto: SendNotificationDto): Promise<Result<void, NotificationFailed>> {
    try {
      await this.sender.send(dto);
      return Result.ok(undefined);
    } catch (err) {
      return Result.fail(NotificationFailed.create((err as Error).message));
    }
  }
}
```

Rules:
- Constructor receives port interfaces only (no concrete classes)
- `execute()` returns `Result<T, E>` — never throws for expected failures
- Import from `domain/` and `application/` only

### 12. Write Application Tests with Mocks

```typescript
// application/__tests__/mocks/notification-sender.mock.ts
export class MockNotificationSender implements INotificationSender {
  sent: SendNotificationDto[] = [];

  async send(dto: SendNotificationDto): Promise<void> {
    this.sent.push(dto);
  }
}
```

```typescript
// application/__tests__/send-notification.use-case.test.ts
describe("SendNotification", () => {
  it("sends a notification successfully", async () => {
    const sender = new MockNotificationSender();
    const useCase = new SendNotification(sender);

    const result = await useCase.execute({
      userId: "user-1",
      channel: "email",
      subject: "Hello",
      body: "Welcome!",
    });

    expect(result.isOk()).toBe(true);
    expect(sender.sent).toHaveLength(1);
  });
});
```

### 13. Define the Public Contract

```typescript
// contracts/notifications.contract.ts
import type { Result } from "../shared/result.js";
import type { SendNotificationDto } from "../application/dto/send-notification.dto.js";
import type { NotificationFailed } from "../domain/errors/notification-failed.error.js";

export interface INotificationsService {
  send(dto: SendNotificationDto): Promise<Result<void, NotificationFailed>>;
}
```

### 14. Write the Factory Function

```typescript
// contracts/notifications.factory.ts
import type { INotificationSender } from "../application/ports/notification-sender.port.js";
import { SendNotification } from "../application/use-cases/send-notification.use-case.js";
import type { INotificationsService } from "./notifications.contract.js";

export type NotificationsServiceDeps = {
  notificationSender: INotificationSender;
};

export function createNotificationsService(
  deps: NotificationsServiceDeps,
): INotificationsService {
  const sendNotification = new SendNotification(deps.notificationSender);
  return {
    send: (dto) => sendNotification.execute(dto),
  };
}
```

### 15. Write the Barrel `index.ts`

```typescript
// contracts/index.ts
export type { INotificationsService } from "./notifications.contract.js";
export { createNotificationsService } from "./notifications.factory.js";
export type { NotificationsServiceDeps } from "./notifications.factory.js";
```

This is the **only** barrel export in the capability. Do not create `index.ts` files in `domain/` or `application/`.

### 16. Create the SKILL.md

Write a skill file at `packages/registry/skills/backcap-notifications/SKILL.md`. See the [Skills concept page](/concepts/skills) for the required format.

### 17. Bundle for the Registry

Add a build step that produces a JSON bundle (`notifications.json`) containing all source files as content strings. The CLI fetches this bundle when users run `npx backcap add notifications`.

The bundle format matches the `registryItemSchema` in `packages/shared/`.

## Checklist Summary

- [ ] Bounded context defined in writing
- [ ] Directory structure created
- [ ] `shared/result.ts` copied
- [ ] Domain errors defined and tested
- [ ] Value objects defined and tested (if applicable)
- [ ] Domain entities defined and tested (if applicable)
- [ ] Domain events defined
- [ ] Port interfaces defined
- [ ] DTOs defined
- [ ] Use cases implemented and tested with mocks
- [ ] Public contract interface defined
- [ ] Factory function written
- [ ] `contracts/index.ts` barrel created
- [ ] `SKILL.md` written
- [ ] Registry bundle produced
