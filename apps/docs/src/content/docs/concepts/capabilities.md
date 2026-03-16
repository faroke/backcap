---
title: Capabilities
description: The four-layer architecture, import rules, and the Result pattern.
---

A **capability** is the core unit of Backcap. It is a self-contained, framework-agnostic module that implements a vertical slice of backend business logic. Examples include `auth`, `blog`, `search`, and `notifications`.

When you run `npx @backcap/cli add auth`, the CLI writes the full TypeScript source of the capability into your project. You own the code — no opaque library, no runtime dependency on Backcap.

## The Four Layers

Every Backcap capability is organized in exactly four layers. The layering is strict: each layer may only import from the layers listed in its import rule.

### 1. domain/

The domain layer contains the core business logic. It has **zero external npm imports** and no framework code of any kind.

```
domain/
  entities/           # Aggregate roots and domain objects
  value-objects/      # Immutable, validated wrappers around primitives
  errors/             # Typed domain error classes
  events/             # Domain events emitted after state changes
  __tests__/          # Unit tests for domain logic
```

**Import rule**: The domain layer imports nothing outside of `domain/` itself and the capability's own `shared/result.ts`.

Example — the `User` entity:

```typescript
// domain/entities/user.entity.ts
export class User {
  private constructor(
    readonly id: string,
    readonly email: Email,
    readonly passwordHash: string,
    readonly roles: string[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    email: string;
    passwordHash: string;
    roles?: string[];
  }): Result<User, InvalidEmail> {
    const emailResult = Email.create(params.email);
    if (emailResult.isFail()) return Result.fail(emailResult.unwrapError());
    // ...
    return Result.ok(new User(/* ... */));
  }
}
```

### 2. application/

The application layer contains use cases, port interfaces, and DTOs.

```
application/
  use-cases/          # One class per use case, one public execute() method
  ports/              # TypeScript interfaces for external dependencies
  dto/                # Plain data shapes for use case inputs and outputs
  __tests__/          # Integration tests using mock implementations
```

**Import rule**: The application layer imports from `domain/` only.

Ports are the key concept here. A port is a TypeScript interface that describes what the use case needs from the outside world — a database, a hash function, a token signer — without saying anything about how it is implemented.

```typescript
// application/ports/user-repository.port.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
```

The use case depends on this interface, not on Prisma or any specific database:

```typescript
// application/use-cases/register-user.use-case.ts
export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<Result<{ userId: string }, Error>> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      return Result.fail(UserAlreadyExists.create(input.email));
    }
    // ...
  }
}
```

### 3. contracts/

The contracts layer is the **public API** of the capability. It exposes exactly one service interface and one factory function. This is the only barrel `index.ts` in the capability.

```
contracts/
  auth.contract.ts    # IAuthService interface
  auth.factory.ts     # createAuthService() function
  index.ts            # Re-exports the contract and factory
```

**Import rule**: The contracts layer imports from `application/` ports and use cases.

```typescript
// contracts/auth.factory.ts
export function createAuthService(deps: AuthServiceDeps): IAuthService {
  const registerUser = new RegisterUser(deps.userRepository, deps.passwordHasher);
  const loginUser = new LoginUser(deps.userRepository, deps.tokenService, deps.passwordHasher);
  return {
    register: (input) => registerUser.execute(input),
    login: (input) => loginUser.execute(input),
  };
}
```

Consumers of the capability only need to know about `IAuthService` and `createAuthService`. The internal use case classes are an implementation detail.

### 4. adapters/

Adapters live **outside the capability directory** in a separate `src/adapters/` tree. An adapter implements a port interface using a specific technology.

```
src/adapters/
  prisma/
    auth/
      user-repository.adapter.ts   # PrismaUserRepository implements IUserRepository
  express/
    auth/
      auth.router.ts               # createAuthRouter() wires IAuthService to HTTP
      auth.middleware.ts           # Bearer token middleware
```

**Import rule**: Adapters import from `application/` ports (for the interface) and `domain/` entities (for type mapping). They must not import from `contracts/`.

## The Result Pattern

Backcap uses a `Result<T, E>` monad for all expected failure conditions. Throwing errors is reserved for truly unexpected situations (programmer errors, environmental failures).

The `Result` class ships inside each capability at `shared/result.ts`:

```typescript
export class Result<T, E extends Error = Error> {
  static ok<T>(value: T): Result<T, never>
  static fail<E extends Error>(error: E): Result<never, E>

  isOk(): boolean
  isFail(): boolean
  unwrap(): T          // throws if isFail()
  unwrapError(): E     // throws if isOk()
  map<U>(fn: (value: T) => U): Result<U, E>
}
```

### Usage Pattern

```typescript
const result = await authService.register({ email, password });

if (result.isFail()) {
  const error = result.unwrapError();
  // TypeScript knows the exact error type here
  if (error instanceof UserAlreadyExists) {
    return res.status(409).json({ error: error.message });
  }
  return res.status(400).json({ error: error.message });
}

const { userId } = result.unwrap();
```

The type system ensures that `unwrap()` is only called after an `isOk()` check. If you call `unwrap()` on a failed result, it re-throws the contained error — but the pattern encourages you never to reach that state.

## File Naming Conventions

Backcap uses kebab-case with typed suffixes for all files:

| Suffix | Example | What It Is |
|---|---|---|
| `.entity.ts` | `user.entity.ts` | Domain entity |
| `.vo.ts` | `email.vo.ts` | Value object |
| `.error.ts` | `invalid-email.error.ts` | Domain error class |
| `.event.ts` | `user-registered.event.ts` | Domain event |
| `.use-case.ts` | `register-user.use-case.ts` | Application use case |
| `.port.ts` | `user-repository.port.ts` | Port interface |
| `.dto.ts` | `register-input.dto.ts` | Data transfer object |
| `.contract.ts` | `auth.contract.ts` | Public service interface |
| `.factory.ts` | `auth.factory.ts` | Factory function |
| `.adapter.ts` | `user-repository.adapter.ts` | Port implementation |

## Dependency Injection

Backcap uses constructor injection throughout. Dependencies flow inward from the adapters layer through the factory in contracts, down into the use cases in application. No IoC container is required.

```typescript
// All wiring happens in one place
const authService = createAuthService({
  userRepository: new PrismaUserRepository(prisma),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(secret),
});
```
