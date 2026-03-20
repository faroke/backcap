# Auth Capability — Extension Guide

Step-by-step instructions for extending the `auth` capability with new use cases, entities,
value objects, and DTOs. All steps assume the capability lives at `domains/auth/`
(the default Backcap path).

---

## Adding a New Use Case

### Example: `LogoutUser`

**Step 1 — Define a new port (if needed)**

If the use case requires a new infrastructure dependency, create a port interface in
`application/ports/`:

```typescript
// application/ports/session-store.port.ts
export interface ISessionStore {
  revoke(token: string): Promise<void>;
  isRevoked(token: string): Promise<boolean>;
}
```

**Step 2 — Create a DTO for input (if non-trivial)**

Plain `interface`, no methods, no classes:

```typescript
// application/dto/logout-input.dto.ts
export interface LogoutInput {
  token: string;
}
```

**Step 3 — Write the use case class**

- File name: `application/use-cases/logout-user.use-case.ts`
- Class name: `LogoutUser`
- Single `execute(input)` method
- Return type: `Promise<Result<void, Error>>`
- Constructor receives only port interfaces (never concrete classes)

```typescript
// application/use-cases/logout-user.use-case.ts
import { Result } from '../../shared/result.js';
import type { ISessionStore } from '../ports/session-store.port.js';
import type { LogoutInput } from '../dto/logout-input.dto.js';

export class LogoutUser {
  constructor(private readonly sessionStore: ISessionStore) {}

  async execute(input: LogoutInput): Promise<Result<void, Error>> {
    await this.sessionStore.revoke(input.token);
    return Result.ok(undefined);
  }
}
```

**Step 4 — Update `AuthServiceDeps` in `contracts/auth.factory.ts`**

Add the new port to the deps type and inject it into the use case:

```typescript
// contracts/auth.factory.ts
import { LogoutUser } from '../application/use-cases/logout-user.use-case.js';
import type { ISessionStore } from '../application/ports/session-store.port.js';

export type AuthServiceDeps = {
  userRepository: IUserRepository;
  tokenService:   ITokenService;
  passwordHasher: IPasswordHasher;
  sessionStore:   ISessionStore;   // new
};

export function createAuthService(deps: AuthServiceDeps): IAuthService {
  const registerUser = new RegisterUser(deps.userRepository, deps.passwordHasher);
  const loginUser    = new LoginUser(deps.userRepository, deps.tokenService, deps.passwordHasher);
  const logoutUser   = new LogoutUser(deps.sessionStore);  // new
  return {
    register: (input) => registerUser.execute(input),
    login:    (input) => loginUser.execute(input),
    logout:   (input) => logoutUser.execute(input),  // new
  };
}
```

**Step 5 — Extend the contract interface in `contracts/auth.contract.ts`**

```typescript
// contracts/auth.contract.ts
import type { LogoutInput } from '../application/dto/logout-input.dto.js';

export interface IAuthService {
  register(input: AuthRegisterInput): Promise<Result<{ userId: string }, Error>>;
  login(input: AuthLoginInput): Promise<Result<AuthLoginOutput, Error>>;
  logout(input: LogoutInput): Promise<Result<void, Error>>;   // new
}
```

**Step 6 — Expose new types from `contracts/index.ts`**

```typescript
// contracts/index.ts  (add to existing exports)
export type { LogoutInput } from '../application/dto/logout-input.dto.js';
```

**Step 7 — Write a co-located test**

```typescript
// application/__tests__/logout-user.use-case.test.ts
import { describe, it, expect } from 'vitest';
import { LogoutUser } from '../use-cases/logout-user.use-case.js';
// Create a mock in application/__tests__/mocks/session-store.mock.ts
import { SessionStoreMock } from './mocks/session-store.mock.js';

describe('LogoutUser', () => {
  it('revokes the token', async () => {
    const store = new SessionStoreMock();
    const useCase = new LogoutUser(store);
    const result = await useCase.execute({ token: 'abc' });
    expect(result.isOk()).toBe(true);
    expect(store.revokedTokens).toContain('abc');
  });
});
```

---

## Adding a New Entity

### Example: `RefreshToken`

**Step 1 — Add typed error(s) if needed**

```typescript
// domain/errors/refresh-token-expired.error.ts
export class RefreshTokenExpired extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefreshTokenExpired';
  }

  static create(tokenId: string): RefreshTokenExpired {
    return new RefreshTokenExpired(`Refresh token "${tokenId}" has expired`);
  }
}
```

**Step 2 — Create the entity**

- Private constructor.
- Static `create` factory returning `Result<Self, SpecificError>`.
- No imports from `application/` or `contracts/`.

```typescript
// domain/entities/refresh-token.entity.ts
import { Result } from '../../shared/result.js';
import { RefreshTokenExpired } from '../errors/refresh-token-expired.error.js';

export class RefreshToken {
  readonly id: string;
  readonly userId: string;
  readonly expiresAt: Date;

  private constructor(id: string, userId: string, expiresAt: Date) {
    this.id        = id;
    this.userId    = userId;
    this.expiresAt = expiresAt;
  }

  static create(params: {
    id: string;
    userId: string;
    expiresAt: Date;
  }): Result<RefreshToken, RefreshTokenExpired> {
    if (params.expiresAt <= new Date()) {
      return Result.fail(RefreshTokenExpired.create(params.id));
    }
    return Result.ok(new RefreshToken(params.id, params.userId, params.expiresAt));
  }

  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }
}
```

**Step 3 — Add a test in `domain/__tests__/`**

```typescript
// domain/__tests__/refresh-token.entity.test.ts
import { describe, it, expect } from 'vitest';
import { RefreshToken } from '../entities/refresh-token.entity.js';

describe('RefreshToken.create', () => {
  it('fails when already expired', () => {
    const past = new Date(Date.now() - 1000);
    const result = RefreshToken.create({ id: '1', userId: 'u1', expiresAt: past });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().name).toBe('RefreshTokenExpired');
  });

  it('succeeds with a future expiry', () => {
    const future = new Date(Date.now() + 60_000);
    const result = RefreshToken.create({ id: '1', userId: 'u1', expiresAt: future });
    expect(result.isOk()).toBe(true);
  });
});
```

---

## Adding a New DTO

DTOs are plain TypeScript `interface` declarations with no methods, no default values, and
no class syntax.

### Example: `RefreshTokenInput`

```typescript
// application/dto/refresh-token-input.dto.ts
export interface RefreshTokenInput {
  refreshToken: string;
}
```

### Example: `RefreshTokenOutput`

```typescript
// application/dto/refresh-token-output.dto.ts
export interface RefreshTokenOutput {
  token: string;
  userId: string;
}
```

Rules for DTOs:
- One interface per file.
- File name follows the pattern `<verb>-<noun>[-input|-output].dto.ts`.
- No imports from domain or application layers inside DTOs — DTOs contain only primitive types
  or other DTOs.
- Expose new DTOs from `contracts/index.ts` when they are part of the public surface.

---

## Adding a New Value Object

### Example: `PhoneNumber`

```typescript
// domain/value-objects/phone-number.vo.ts
import { Result } from '../../shared/result.js';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export class PhoneNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Result<PhoneNumber, DomainError> {
    if (!E164_REGEX.test(value)) {
      return Result.fail(new DomainError(`Invalid phone number: "${value}". Expected E.164 format.`));
    }
    return Result.ok(new PhoneNumber(value));
  }
}
```

Value object checklist:
- `readonly` properties only.
- `private constructor` + `static create` returning `Result`.
- Validation lives inside `create`; the constructor assumes valid input.
- No imports outside `domain/` and `shared/result.ts`.
- Co-located test in `domain/__tests__/phone-number.vo.test.ts`.
