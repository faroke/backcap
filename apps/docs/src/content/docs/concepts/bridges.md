---
title: Bridges
description: Cross-capability use cases that wire two or more capabilities together.
---

A **bridge** is a standalone module that connects two or more capabilities. Bridges implement cross-cutting logic that does not belong inside any single capability — for example, sending a welcome email when a new user registers.

Without bridges, you would have to modify the `auth` capability to import from `notifications`, violating the principle that each capability is self-contained. Bridges solve this by living outside both capabilities and importing from both of their public contracts.

## Anatomy of a Bridge

The `auth-notifications` bridge is the reference implementation. It responds to the `UserRegistered` domain event emitted by the `auth` capability and calls an `IEmailSender` port to deliver a welcome email.

```
src/bridges/
  auth-notifications/
    domain/
      events/
        user-registered.event.ts    # Re-export / type import from auth
    dto/
      welcome-email.dto.ts
    errors/
      send-welcome-email.error.ts
    use-cases/
      send-welcome-email.use-case.ts
    contracts/
      auth-notifications.contract.ts
      index.ts
    shared/
      result.ts
```

## The Bridge Use Case

A bridge use case consumes an event from one capability and calls a port from another:

```typescript
// src/bridges/auth-notifications/use-cases/send-welcome-email.use-case.ts
export class SendWelcomeEmailUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(event: UserRegistered): Promise<Result<void, SendWelcomeEmailError>> {
    try {
      const dto: WelcomeEmailDto = {
        recipientEmail: event.email,
        userId: event.userId,
        occurredAt: event.occurredAt,
      };

      await this.emailSender.sendEmail(dto);
      return Result.ok(undefined);
    } catch (err) {
      return Result.fail(new SendWelcomeEmailError(err));
    }
  }
}
```

The bridge use case depends on `IEmailSender` — a port interface it defines itself. The actual email implementation (SendGrid, Resend, nodemailer) is provided by an adapter at wiring time.

## Installing a Bridge

Use `backcap bridges` to see which bridges are available for your installed capabilities:

```bash
npx @backcap/cli bridges
```

The CLI fetches the bridge catalog from the registry and filters it to show only bridges whose dependencies are all installed in your project. Install a bridge with:

```bash
npx @backcap/cli add auth-notifications
```

## Wiring a Bridge

After installation, wire the bridge in your container:

```typescript
// src/container.ts
import { SendWelcomeEmailUseCase } from "./bridges/auth-notifications/use-cases/send-welcome-email.use-case";
import { ResendEmailAdapter } from "./adapters/resend/email.adapter";

const emailSender = new ResendEmailAdapter(process.env.RESEND_API_KEY!);
const sendWelcomeEmail = new SendWelcomeEmailUseCase(emailSender);
```

Then call the bridge use case after a successful registration:

```typescript
const registerResult = await authService.register({ email, password });

if (registerResult.isOk()) {
  const { userId, event } = registerResult.unwrap();
  // event is a UserRegistered domain event
  await sendWelcomeEmail.execute(event);
}
```

## Bridge vs. Capability

| | Capability | Bridge |
|---|---|---|
| Purpose | Implements a bounded context | Connects two capabilities |
| Location | `src/capabilities/<name>/` | `src/bridges/<name>/` |
| Dependencies | Zero external imports in domain | Imports from multiple capabilities |
| Port interfaces | Defines its own ports | Defines its own ports for external services |
| Installed via | `backcap add <name>` | `backcap add <bridge-name>` |

## Bridge Conventions

- A bridge name uses the format `<cap-a>-<cap-b>` (e.g., `auth-notifications`)
- A bridge has its own `shared/result.ts` copy
- A bridge has its own `contracts/index.ts` for its public surface
- A bridge defines its own port interfaces for any external services it needs
- A bridge has no knowledge of framework details — it only depends on port interfaces

## Discovering Available Bridges

The registry catalog tracks which bridges exist and what capabilities each bridge requires. Running `backcap bridges` will show:

```
Available Bridges

  auth-notifications — Sends a welcome email on UserRegistered
    Dependencies: auth, notifications | Status: available

  auth-audit — Records login and registration events to the audit log
    Dependencies: auth, audit-log | Status: available
```

The `Status` field shows `installed` if the bridge is already in your project, and `available` if it can be installed (all its dependencies are present).
