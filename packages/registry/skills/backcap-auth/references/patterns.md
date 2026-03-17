# Auth Capability — Patterns Reference

Auth-specific coding patterns, conventions, and design decisions.

---

## Password Handling

Passwords are **never stored or logged in plain text**. The `IPasswordHasher` port abstracts
the hashing algorithm so the domain and application layers have no dependency on bcrypt, argon2,
or any other library.

### Flow

1. `RegisterUser` use case receives a plaintext `password: string` in `RegisterInput`.
2. It calls `IPasswordHasher.hash(plain)` immediately — before creating the `User` entity.
3. The resulting `passwordHash: string` is stored on `User`.
4. The plaintext password is never passed to `User.create` and never persisted.

```typescript
// Correct — hash before creating the entity
const passwordHash = await this.passwordHasher.hash(input.password);
const userResult = User.create({ id, email: input.email, passwordHash });

// Wrong — do not pass plaintext to the entity
const userResult = User.create({ id, email: input.email, passwordHash: input.password });
```

### `Password` Value Object

`Password.create(plain)` is available for **input validation** (min 8 chars, at least one
non-alphabetic character) but is **not required** by `RegisterUser`. Add it if your business
rules demand validation before hashing:

```typescript
const passwordResult = Password.create(input.password);
if (passwordResult.isFail()) {
  return Result.fail(passwordResult.unwrapError());
}
const passwordHash = await this.passwordHasher.hash(passwordResult.unwrap().value);
```

---

## User Enumeration Prevention

`LoginUser` deliberately returns `InvalidCredentials` for **both** failure cases:

- User does not exist (`IUserRepository.findByEmail` returns `null`).
- User exists but password is wrong.

This prevents attackers from determining whether an email address is registered by observing
different error messages or timings.

```typescript
// Correct pattern in LoginUser
const user = await this.userRepository.findByEmail(input.email);
if (!user) {
  return Result.fail(InvalidCredentials.create());  // NOT UserNotFound
}

const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
if (!isValid) {
  return Result.fail(InvalidCredentials.create());
}
```

The `UserNotFound` error class exists in the domain layer but is reserved for administrative
lookups (e.g. `findById` when the caller already holds a trusted user ID).

---

## Token Lifecycle

Token generation and verification are entirely behind the `ITokenService` port. The domain
and application layers know nothing about JWT, session cookies, or any other token format.

```typescript
interface ITokenService {
  generate(userId: string, roles: string[]): Promise<string>;
  verify(token: string): Promise<{ userId: string } | null>;
}
```

- `generate` receives `userId` and `roles` (the minimal claims needed downstream).
- `verify` returns `null` for any invalid state (expired, malformed, wrong signature) —
  never throws.
- The `auth.middleware.ts` Express adapter calls `verify` and maps `null` to HTTP 401.

---

## Result Pattern in Auth

All expected failures in auth use `Result<T, E>`. Never throw from use cases for domain errors.

```typescript
// Use case return signature
async execute(input: LoginInput): Promise<Result<LoginOutput, Error>>

// Checking the result in an adapter
const result = await authService.login({ email, password });
if (result.isFail()) {
  const { status, message } = toHttpError(result.unwrapError());
  res.status(status).json({ error: message });
  return;
}
res.status(200).json(result.unwrap());
```

### Error-to-HTTP mapping (Express adapter)

```typescript
function toHttpError(error: Error): { status: number; message: string } {
  if (error instanceof UserAlreadyExists)  return { status: 409, message: error.message };
  if (error instanceof UserNotFound)       return { status: 401, message: 'Invalid credentials' };
  if (error instanceof InvalidCredentials) return { status: 401, message: 'Invalid credentials' };
  if (error instanceof InvalidEmail)       return { status: 400, message: error.message };
  return { status: 500, message: 'Internal server error' };
}
```

Note that `UserNotFound` maps to 401 with a generic message, not 404, to avoid leaking
whether the email is registered.

---

## Domain Event Pattern

`RegisterUser` returns the `UserRegistered` event inside the `Result` payload:

```typescript
return Result.ok({ userId: user.id, event: new UserRegistered(user.id, user.email.value) });
```

The calling layer (adapter, controller, or application bootstrapper) decides what to do with
the event:

```typescript
// Option A — forward to a bridge use case directly
const { userId, event } = result.unwrap();
await sendWelcomeEmailUseCase.execute(event);

// Option B — publish to a message bus
const { userId, event } = result.unwrap();
await eventBus.publish(event);

// Option C — ignore the event
const { userId } = result.unwrap();
```

Events are never automatically dispatched; they must be forwarded explicitly. This keeps the
use case side-effect-free and makes tests deterministic.

---

## DI Wiring Pattern

The `createAuthService` factory is the **only** place where concrete classes are instantiated
and dependencies are wired. Adapters and the host application call the factory once at startup:

```typescript
import { createAuthService } from './capabilities/auth/contracts/index.js';
import { PrismaUserRepository } from './adapters/prisma/auth/user-repository.adapter.js';
import { BcryptPasswordHasher }  from './adapters/bcrypt/password-hasher.adapter.js';
import { JwtTokenService }       from './adapters/jwt/token-service.adapter.js';

const authService = createAuthService({
  userRepository: new PrismaUserRepository(prisma),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService:   new JwtTokenService(process.env.JWT_SECRET),
});
```

The `IAuthService` handle is then passed to the Express router:

```typescript
createAuthRouter(authService, router);
```

---

## Mock Pattern for Tests

Test mocks implement port interfaces and expose state for assertions:

```typescript
// application/__tests__/mocks/user-repository.mock.ts
import type { IUserRepository } from '../../ports/user-repository.port.js';
import type { User } from '../../../domain/entities/user.entity.js';

export class UserRepositoryMock implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email.value === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  // Test helpers
  seed(user: User): void {
    this.users.push(user);
  }

  get all(): User[] {
    return [...this.users];
  }
}
```

Mocks live in `application/__tests__/mocks/` and are only imported in test files.

---

## Fixture Pattern

Fixtures provide pre-built valid domain objects for tests:

```typescript
// application/__tests__/fixtures/user.fixture.ts
import { User } from '../../../domain/entities/user.entity.js';

export function buildUserFixture(overrides?: Partial<{
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
}>): User {
  const result = User.create({
    id:           overrides?.id           ?? 'user-1',
    email:        overrides?.email        ?? 'alice@example.com',
    passwordHash: overrides?.passwordHash ?? '$2b$10$hashedvalue',
    roles:        overrides?.roles,
  });
  // In fixtures, use unwrap() — we control the data and know it is valid
  return result.unwrap();
}
```

Use `unwrap()` in fixtures because the data is trusted test data. Never use `unwrap()` in
production application code.
