# Auth Capability — Bridges Reference

Bridges are standalone modules that connect two or more capabilities. They follow the same
Clean Architecture layering as capabilities but live in `bridges/` and are installed separately.

---

## `auth-notifications`

**Status**: available

**Dependencies**: `auth`

**Purpose**: Listens to the `UserRegistered` domain event emitted by `RegisterUser` and sends
a welcome email via an `IEmailSender` port.

### Install

```bash
npx @backcap/cli add bridge auth-notifications
```

### Directory Structure

```
bridges/auth-notifications/
  contracts/
    auth-notifications.contract.ts
    index.ts
  domain/events/
    user-registered.event.ts
  use-cases/
    send-welcome-email.use-case.ts
  dto/
    welcome-email.dto.ts
  errors/
    send-welcome-email.error.ts
  shared/
    result.ts
  __tests__/
    send-welcome-email.use-case.test.ts
    user-registered.event.test.ts
```

### Public Surface

#### `contracts/auth-notifications.contract.ts`

```typescript
interface AuthNotificationsBridgeContract {
  sendWelcomeEmail(event: UserRegistered): Promise<Result<void, SendWelcomeEmailError>>;
}
```

#### `contracts/index.ts`

```typescript
export type { AuthNotificationsBridgeContract } from './auth-notifications.contract.js';
export type { WelcomeEmailDto } from '../dto/welcome-email.dto.js';
export { SendWelcomeEmailError } from '../errors/send-welcome-email.error.js';
```

Import everything from `bridges/auth-notifications/contracts`.

### Key Files

#### `domain/events/user-registered.event.ts`

A local copy of the `UserRegistered` event shape (mirrored from `auth` capability). It accepts
the event as a plain object:

```typescript
class UserRegistered {
  readonly userId:     string;
  readonly email:      string;
  readonly occurredAt: Date;

  constructor(props: { userId: string; email: string; occurredAt?: Date }) {
    this.userId     = props.userId;
    this.email      = props.email;
    this.occurredAt = props.occurredAt ?? new Date();
  }
}
```

Note: the bridge's `UserRegistered` uses an object-params constructor (vs. the capability's
positional constructor) to simplify construction from bus messages.

#### `dto/welcome-email.dto.ts`

```typescript
interface WelcomeEmailDto {
  recipientEmail: string;
  userId: string;
  occurredAt: Date;
}
```

#### `errors/send-welcome-email.error.ts`

```typescript
class SendWelcomeEmailError extends Error {
  readonly cause: unknown;
  constructor(cause: unknown)
  // message: "Failed to send welcome email"
}
```

#### `use-cases/send-welcome-email.use-case.ts`

**Export**: `SendWelcomeEmailUseCase`, `IEmailSender`

```typescript
interface IEmailSender {
  sendEmail(dto: WelcomeEmailDto): Promise<void>;
}

class SendWelcomeEmailUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(event: UserRegistered): Promise<Result<void, SendWelcomeEmailError>>
}
```

The use case maps `UserRegistered` to `WelcomeEmailDto` and calls `IEmailSender.sendEmail`.
Any exception thrown by `emailSender` is caught and wrapped in `SendWelcomeEmailError`.

### Wiring into Your Application

```typescript
import { SendWelcomeEmailUseCase } from './bridges/auth-notifications/use-cases/send-welcome-email.use-case.js';
import { createAuthService } from './capabilities/auth/contracts/index.js';

const authService = createAuthService({ userRepository, tokenService, passwordHasher });
const sendWelcomeEmail = new SendWelcomeEmailUseCase(myEmailSenderAdapter);

// In your registration handler:
const result = await authService.register({ email, password });
if (result.isOk()) {
  const { event } = result.unwrap();
  await sendWelcomeEmail.execute(event);
}
```

### Implementing `IEmailSender`

`IEmailSender` is defined inside the bridge's `use-cases/send-welcome-email.use-case.ts`.
Create an adapter in your project that implements it:

```typescript
// adapters/sendgrid/send-welcome-email.adapter.ts
import type { IEmailSender } from '../../bridges/auth-notifications/use-cases/send-welcome-email.use-case.js';
import type { WelcomeEmailDto } from '../../bridges/auth-notifications/dto/welcome-email.dto.js';

export class SendgridEmailSender implements IEmailSender {
  async sendEmail(dto: WelcomeEmailDto): Promise<void> {
    await sgMail.send({
      to:      dto.recipientEmail,
      from:    'no-reply@example.com',
      subject: 'Welcome!',
      text:    `Hi! Your account (${dto.userId}) was created on ${dto.occurredAt.toISOString()}.`,
    });
  }
}
```

---

## `auth-audit-log` (planned)

**Status**: planned

**Dependencies**: `auth`, `audit-log`

**Purpose**: Writes an immutable audit entry for every login attempt, successful registration,
and failed-login event.

### Planned Contract

```typescript
interface AuthAuditLogBridgeContract {
  onUserRegistered(event: UserRegistered): Promise<void>;
  onUserLoggedIn(event: UserLoggedIn): Promise<void>;
  onLoginFailed(event: LoginFailed): Promise<void>;
}
```

This bridge will be available once the `audit-log` capability ships. Check
`npx @backcap/cli bridges` after installing `auth` and `audit-log` to see when it becomes available.

---

## Bridge Conventions

All bridges follow the same structural rules as capabilities:

| Rule | Detail |
|---|---|
| Barrel in `contracts/` only | No `index.ts` outside `contracts/` |
| `shared/result.ts` inlined | Copied into the bridge; no shared npm package |
| `IXxx` ports defined locally | The bridge defines its own infrastructure ports |
| Tests co-located | `__tests__/` inside the bridge root |
| Zero npm deps in use cases | No framework imports in `use-cases/` |
| Event mirroring | Bridges re-declare the minimal event shape they consume; they do not import from the source capability |

The "event mirroring" rule decouples bridge evolution from capability evolution. A bridge
consumes the event by duck-typing; as long as the event carries the expected fields, the bridge
continues to work even if the source capability refactors its event hierarchy.
