---
name: backcap-auth
description: >
  Backcap auth capability: DDD-structured user registration and login for TypeScript backends.
  Domain layer contains User entity, Email and Password value objects, and four typed errors
  (InvalidEmail, InvalidCredentials, UserNotFound, UserAlreadyExists). Application layer has
  RegisterUser and LoginUser use cases, plus IUserRepository, IPasswordHasher, and ITokenService
  port interfaces. Public surface is IAuthService and createAuthService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Adapters: auth-express (router +
  Bearer middleware), auth-prisma (PrismaUserRepository). Bridge: auth-notifications fires
  SendWelcomeEmailUseCase on UserRegistered event. Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-auth

The `auth` capability provides **user registration and login** for TypeScript backends. It is
structured in strict Clean Architecture layers and has zero npm dependencies in the domain and
application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

See [`references/domain-map.md`](references/domain-map.md) for a full file-by-file reference.

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/user.entity.ts` | `User` | Aggregate root. Holds `id`, `email: Email`, `passwordHash`, `roles`, timestamps. Private constructor; factory via `User.create(params)` returning `Result<User, InvalidEmail>`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/email.vo.ts` | `Email` | Validates email against RFC-5321-simplified regex. `Email.create(value)` returns `Result<Email, InvalidEmail>`. |
| `domain/value-objects/password.vo.ts` | `Password` | Validates min 8 chars and at least one non-alphabetic character. `Password.create(value)` returns `Result<Password, DomainError>`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/invalid-email.error.ts` | `InvalidEmail` | `Invalid email address: "<value>"` |
| `domain/errors/invalid-credentials.error.ts` | `InvalidCredentials` | `Invalid email or password` |
| `domain/errors/user-not-found.error.ts` | `UserNotFound` | `User not found with id: "<id>"` |
| `domain/errors/user-already-exists.error.ts` | `UserAlreadyExists` | `User already exists with email: "<email>"` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/user-registered.event.ts` | `UserRegistered` | `userId: string`, `email: string`, `occurredAt: Date` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/user-repository.port.ts` | `IUserRepository` | `findByEmail(email)`, `save(user)`, `findById(id)` |
| `application/ports/password-hasher.port.ts` | `IPasswordHasher` | `hash(plain)`, `compare(plain, hash)` |
| `application/ports/token-service.port.ts` | `ITokenService` | `generate(userId, roles)`, `verify(token)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/register-input.dto.ts` | `RegisterInput` | `email: string`, `password: string` |
| `application/dto/login-input.dto.ts` | `LoginInput` | `email: string`, `password: string` |
| `application/dto/login-output.dto.ts` | `LoginOutput` | `token: string`, `userId: string` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/register-user.use-case.ts` | `RegisterUser` | `Result<{ userId: string; event: UserRegistered }, Error>` |
| `application/use-cases/login-user.use-case.ts` | `LoginUser` | `Result<LoginOutput, Error>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/auth.contract.ts` | `IAuthService`, `AuthRegisterInput`, `AuthLoginInput`, `AuthLoginOutput` | The only public interface consumers depend on |
| `contracts/auth.factory.ts` | `createAuthService(deps: AuthServiceDeps): IAuthService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

### Adapters

| File | Export | Implements |
|---|---|---|
| `adapters/express/auth/auth.router.ts` | `createAuthRouter(authService, router)` | `POST /auth/register` → 201 / 409 / 400; `POST /auth/login` → 200 / 401 |
| `adapters/express/auth/auth.middleware.ts` | `createAuthMiddleware(tokenService)` | Bearer token verification; sets `req.user.userId` |
| `adapters/prisma/auth/user-repository.adapter.ts` | `PrismaUserRepository` | `IUserRepository` backed by Prisma |
| `adapters/prisma/auth/auth.schema.prisma` | — | Prisma `User` model fragment to merge into `schema.prisma` |

## Extension Guide

See [`references/extension-guide.md`](references/extension-guide.md) for step-by-step
instructions on adding use cases, entities, and DTOs.

### Quick summary

- **New use case**: add to `application/use-cases/`, declare new ports in `application/ports/`
  if needed, wire into `contracts/auth.factory.ts`, expose types from `contracts/index.ts`.
- **New entity / VO**: add to `domain/entities/` or `domain/value-objects/`, private constructor,
  `static create` returning `Result`.
- **New DTO**: add to `application/dto/`, plain `interface`, no methods.
- **New adapter**: add to `adapters/<framework>/auth/`, implement the relevant port interface.

## Conventions

See [`references/patterns.md`](references/patterns.md) for auth-specific patterns.

Auth-specific rules:
- Passwords are **never stored in plain text**; the `IPasswordHasher` port abstracts hashing.
- Tokens are **never generated in the domain layer**; the `ITokenService` port is application-layer.
- The `LoginUser` use case returns a generic `InvalidCredentials` error for both "not found" and
  "wrong password" paths — this prevents user enumeration.
- `UserRegistered` event is returned in the `RegisterUser` result payload for the caller to
  forward to bridges or a message bus.

## Available Bridges

| Bridge | Description | Install |
|---|---|---|
| `auth-notifications` | Sends a welcome email when a user registers | `backcap add bridge auth-notifications` |
| `auth-audit-log` | Logs login, registration, and failed-login events | `backcap add bridge auth-audit-log` (planned) |

See [`references/bridges.md`](references/bridges.md) for detailed bridge documentation.

## CLI Commands

| Command | Description |
|---|---|
| `backcap init` | Scaffold `backcap.json` in the current project |
| `backcap list` | List all available capabilities from the registry |
| `backcap add auth` | Install the auth capability (prompts for adapter selection) |
| `backcap bridges` | List bridges compatible with installed capabilities |
| `backcap add bridge auth-notifications` | Install the auth-notifications bridge |
