---
title: Architecture
description: How Backcap applies clean architecture and hexagonal architecture principles.
---

Backcap is built on two complementary architectural patterns: **Clean Architecture** (Robert C. Martin) and **Hexagonal Architecture** (Alistair Cockburn, also known as ports and adapters). Understanding these patterns explains every design decision in the codebase.

## Clean Architecture

Clean Architecture organizes code in concentric circles. The innermost circle contains the most stable, abstract business rules. The outer circles contain the most volatile, concrete details. The Dependency Rule states: **source code dependencies must point inward only**.

In Backcap, the circles map to layers:

```
┌─────────────────────────────────────────┐
│              adapters/                  │  ← Most volatile (framework, DB)
│   ┌─────────────────────────────────┐   │
│   │          contracts/             │   │  ← Public API surface
│   │   ┌─────────────────────────┐   │   │
│   │   │      application/       │   │   │  ← Use cases and ports
│   │   │   ┌─────────────────┐   │   │   │
│   │   │   │    domain/      │   │   │   │  ← Most stable (pure business logic)
│   │   │   └─────────────────┘   │   │   │
│   │   └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

Arrows (imports) only point inward. The domain never knows about the application. The application never knows about Express or Prisma.

## Hexagonal Architecture (Ports and Adapters)

Hexagonal architecture focuses on the boundary between the application core and the outside world. The core is surrounded by **ports** (interfaces defined by the application) and **adapters** (implementations provided by infrastructure code).

```
                    ┌──────────────┐
   HTTP Request ───►│ auth.router  │
                    │  (adapter)   │
                    └──────┬───────┘
                           │ IAuthService
                    ┌──────▼───────┐
                    │  contracts/  │
                    │createAuth    │
                    │  Service()   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
    ┌─────────▼──┐  ┌──────▼────┐  ┌───▼──────────┐
    │IUserRepo   │  │IPassword  │  │ITokenService │
    │(port)      │  │Hasher     │  │(port)        │
    │            │  │(port)     │  │              │
    └─────────┬──┘  └──────┬────┘  └───┬──────────┘
              │            │            │
    ┌─────────▼──┐  ┌──────▼────┐  ┌───▼──────────┐
    │PrismaUser  │  │Bcrypt     │  │JwtToken      │
    │Repository  │  │Password   │  │Service       │
    │(adapter)   │  │Hasher     │  │(adapter)     │
    └────────────┘  └───────────┘  └──────────────┘
```

The use cases in `application/` depend only on the port interfaces. The actual implementations (Prisma, bcrypt, JWT) are provided at wiring time and can be swapped freely.

## Project Directory Layout

A Backcap project has the following structure after installing `auth`:

```
your-project/
  backcap.json                          # Configuration file
  src/
    domains/
      auth/
        domain/
          entities/user.entity.ts
          value-objects/email.vo.ts
          value-objects/password.vo.ts
          errors/invalid-email.error.ts
          errors/invalid-credentials.error.ts
          errors/user-not-found.error.ts
          errors/user-already-exists.error.ts
          events/user-registered.event.ts
        application/
          use-cases/register-user.use-case.ts
          use-cases/login-user.use-case.ts
          ports/user-repository.port.ts
          ports/password-hasher.port.ts
          ports/token-service.port.ts
          dto/register-input.dto.ts
          dto/login-input.dto.ts
          dto/login-output.dto.ts
        contracts/
          auth.contract.ts
          auth.factory.ts
          index.ts
        shared/
          result.ts
    adapters/
      persistence/
        prisma/
          auth/
            user-repository.adapter.ts
      http/
        express/
          auth/
            auth.router.ts
            auth.middleware.ts
    bridges/
      auth-notifications/
        bridge.json                              # Machine-readable manifest
        auth-notifications.bridge.ts             # Factory + event subscriptions
        use-cases/send-welcome-email.use-case.ts
        contracts/auth-notifications.contract.ts
        domain/events/user-registered.event.ts
        dto/welcome-email.dto.ts
        shared/result.ts
        __tests__/
```

## Registry Package Layout

The Backcap registry (the npm workspace package at `packages/registry/`) mirrors this structure for authoring domains before they are distributed:

```
packages/registry/
  domains/
    auth/              # Authored source of the auth domain
  adapters/
    prisma/auth/       # Prisma adapter for auth
    express/auth/      # Express adapter for auth
  bridges/
    auth-notifications/  # Bridge between auth and notifications
  skills/
    backcap-core/      # Architecture skill file for AI tools
    backcap-auth/      # Auth domain skill file
```

## The Result Monad vs. Exceptions

Backcap uses `Result<T, E>` instead of thrown exceptions for all **expected** failures. This is a deliberate design choice with several advantages:

**Explicit failure modes**: The return type of a use case documents exactly which errors are possible. For example, `Result<{ userId: string; event: UserRegistered }, Error>` is self-documenting — callers know both the success payload and possible failure types.

**No unchecked exceptions**: TypeScript's type system cannot track which functions throw. `Result` makes error handling a compile-time concern, not a runtime surprise.

**Composability**: `Result.map()` allows transforming success values while threading errors through. The pattern scales cleanly to chains of operations.

Thrown exceptions are reserved for programmer errors and environmental failures that cannot be recovered from (network timeouts, database connection errors, configuration mistakes at startup).

## Framework Agnosticism

The domain and application layers have no framework imports. This is enforced by the import rules:

- `domain/` — no external imports except the domain's own `shared/result.ts`
- `application/` — imports `domain/` and the domain's own `shared/result.ts`

This means the same `auth` domain can be used with:

- **Express** via `createAuthRouter()`
- **Fastify** via a custom Fastify adapter
- **Next.js** via API route handlers
- **NestJS** via injectable service wrappers

The runtime (Node, Bun, Deno) does not matter to the core logic either.

## Testing Strategy

The layered architecture makes testing straightforward:

- **Domain layer**: Pure unit tests. No mocks needed — entities and value objects are deterministic functions.
- **Application layer**: Tests use mock implementations of port interfaces (in-memory repositories, simple hash functions). No database needed.
- **Adapters**: Integration tests that use real infrastructure (a test database, a real bcrypt call). These are the only tests that require external services.

This means the vast majority of tests run instantly with no infrastructure setup.
