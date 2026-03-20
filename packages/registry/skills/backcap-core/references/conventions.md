# Backcap Conventions Reference

This document is the authoritative reference for all structural and coding conventions used
across Backcap capabilities, adapters, and bridges.

---

## File Naming

All files use **kebab-case** with a mandatory typed suffix that signals the role of the module.

| Suffix | Used for | Example |
|---|---|---|
| `.entity.ts` | Domain entity (aggregate root or child entity) | `user.entity.ts` |
| `.vo.ts` | Value object (immutable, validated wrapper) | `email.vo.ts`, `password.vo.ts` |
| `.use-case.ts` | Application use case class | `register-user.use-case.ts` |
| `.port.ts` | Port interface (application layer) | `user-repository.port.ts` |
| `.dto.ts` | Data transfer object (plain interface) | `login-input.dto.ts` |
| `.event.ts` | Domain event class | `user-registered.event.ts` |
| `.error.ts` | Typed error class | `invalid-credentials.error.ts` |
| `.contract.ts` | Public service interface | `auth.contract.ts` |
| `.factory.ts` | DI factory function | `auth.factory.ts` |
| `.adapter.ts` | Port implementation (adapter layer) | `user-repository.adapter.ts` |
| `.middleware.ts` | Framework middleware | `auth.middleware.ts` |
| `.router.ts` | Framework route handler | `auth.router.ts` |
| `.test.ts` | Unit or integration test | `user.entity.test.ts` |
| `.mock.ts` | Test mock implementing a port | `user-repository.mock.ts` |
| `.fixture.ts` | Test fixture (pre-built domain objects) | `user.fixture.ts` |

---

## Architecture Layers

### `domain/`

- Contains: entities, value objects, domain errors, domain events.
- **No external imports** — the only permitted import is `../../shared/result.ts`.
- No framework code, no ORM types, no `node:` modules.
- All constructors are `private`; creation goes through `static create(...)` returning
  `Result<Self, Error>`.

### `application/`

- Contains: use case classes (`use-cases/`), port interfaces (`ports/`), DTOs (`dto/`).
- **Imports `domain/` only** — never imports from `contracts/`, `adapters/`, or any framework.
- Port interfaces (`IFooRepository`, `ITokenService`, etc.) define the infrastructure contract
  from the application's perspective.
- Use cases receive dependencies via **constructor injection** and expose a single
  `execute(input)` method.
- Use case return type is always `Promise<Result<Output, Error>>`.

### `contracts/`

- Contains: the public service interface (`<name>.contract.ts`), the DI factory
  (`<name>.factory.ts`), and the barrel (`index.ts`).
- **The only `index.ts` barrel in the capability** — consuming code imports only from `contracts/`.
- The factory function (`createXxxService(deps: XxxServiceDeps): IXxxService`) is the single
  public entry point that wires the full object graph.
- `contracts/` imports from `application/` ports and use cases, and from `domain/` errors
  (for re-export only if needed).

### `adapters/`

- Contains: concrete implementations of ports defined in `application/ports/`.
- Stored outside the capability directory: `adapters/<framework>/<capability>/` or
  `adapters/<orm>/<capability>/`.
- May import from the capability's `application/ports/` and `domain/entities/`.
- **Never imported directly** by `domain/` or `application/`.
- No barrel files; adapters are wired by the host application using the factory from `contracts/`.

---

## Barrel File Rule

`index.ts` exists in **exactly one place** per capability: `contracts/index.ts`.

There are no barrel files in `domain/`, `application/`, `application/ports/`,
`application/use-cases/`, `application/dto/`, or `adapters/`.

This prevents circular imports, makes tree-shaking trivial, and keeps dependency graphs legible.

---

## Result Pattern

All expected failure paths return `Result<T, E extends Error>` instead of throwing.

```typescript
// Shape of Result<T, E>
Result.ok(value)         // wraps a success value
Result.fail(error)       // wraps a typed error
result.isOk()            // true when ok
result.isFail()          // true when failed
result.unwrap()          // returns T, throws if failed
result.unwrapError()     // returns E, throws if ok
result.map(fn)           // transforms T -> U, passes error through
```

Rules:
- Use cases **never throw** for expected domain failures; they return `Result.fail(...)`.
- Infrastructure errors (network, DB) may bubble as real exceptions; use cases may catch and
  wrap them in a typed error before returning `Result.fail`.
- Domain objects (`static create`) return `Result` when validation can fail.
- `shared/result.ts` is copied into each capability; it has no external dependencies.

---

## DI Pattern

Dependencies are injected via **constructor injection** only. No service locators, no global
singletons, no IoC container in domain or application layers.

The `contracts/<name>.factory.ts` file is the composition root for a capability:

```typescript
export type AuthServiceDeps = {
  userRepository: IUserRepository;   // port interface
  tokenService: ITokenService;       // port interface
  passwordHasher: IPasswordHasher;   // port interface
};

export function createAuthService(deps: AuthServiceDeps): IAuthService {
  const registerUser = new RegisterUser(deps.userRepository, deps.passwordHasher);
  const loginUser    = new LoginUser(deps.userRepository, deps.tokenService, deps.passwordHasher);
  return {
    register: (input) => registerUser.execute(input),
    login:    (input) => loginUser.execute(input),
  };
}
```

Consumers call `createAuthService({ userRepository, tokenService, passwordHasher })` once at
startup and receive an `IAuthService` handle.

---

## Domain Events

Domain events are plain classes in `domain/events/<name>.event.ts`. They carry the minimal
data needed by downstream consumers and include an `occurredAt: Date` timestamp.

```typescript
export class UserRegistered {
  readonly userId:    string;
  readonly email:     string;
  readonly occurredAt: Date;

  constructor(userId: string, email: string, occurredAt: Date = new Date()) {
    this.userId     = userId;
    this.email      = email;
    this.occurredAt = occurredAt;
  }
}
```

Events are **returned** from use cases as part of the `Result` payload, not emitted via a
global event bus. The calling application layer decides whether to forward them to a bus,
a bridge, or ignore them.

---

## Test Co-location

Tests live in an `__tests__/` directory **inside the layer they test**:

```
domain/__tests__/
  user.entity.test.ts
  email.vo.test.ts

application/__tests__/
  register-user.use-case.test.ts
  mocks/
    user-repository.mock.ts
    password-hasher.mock.ts
  fixtures/
    user.fixture.ts
```

There is no top-level `tests/` or `__tests__/` directory at the capability root.

Mocks implement the full port interface and are placed in `__tests__/mocks/`.
Fixtures are pre-built domain objects in `__tests__/fixtures/`.

---

## Zero-Dependency Guarantee

The `domain/` and `application/` layers must have **zero npm dependencies**. This is enforced
by convention and validated during registry quality checks.

`shared/result.ts` is inlined per-capability (no shared npm package) to preserve this guarantee.

Adapters may have npm dependencies (e.g. `@prisma/client`, `express`) but these are declared
as `peerDependencies` in the registry item so the host project controls version selection.
