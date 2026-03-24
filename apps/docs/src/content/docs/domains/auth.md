---
title: Auth Domain
description: User registration and login for TypeScript backends — domain model, use cases, and ports.
---

The `auth` domain provides **user registration and login** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add auth
```

## Domain Model

### User Entity

The `User` entity is the aggregate root of the auth domain. It holds the user's identity, credentials, roles, and timestamps.

```typescript
import { User } from "./domains/auth/domain/entities/user.entity";

const result = User.create({
  id: crypto.randomUUID(),
  email: "user@example.com",
  passwordHash: await passwordHasher.hash("password123"),
  roles: ["user"],
});

if (result.isOk()) {
  const user = result.unwrap();
  console.log(user.id, user.email.value, user.roles);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `email` | `Email` | Validated email value object |
| `passwordHash` | `string` | Bcrypt/argon2 hash — never the plain password |
| `roles` | `string[]` | Array of role strings, defaults to `["user"]` |
| `createdAt` | `Date` | Set on creation |
| `updatedAt` | `Date` | Set on creation, updated on mutation |

`User.create()` returns `Result<User, InvalidEmail>`. If the email is invalid, the result is a failure with an `InvalidEmail` error.

`user.updateEmail(newEmail)` returns `Result<User, InvalidEmail>` — a new `User` instance with the updated email.

### Email Value Object

```typescript
import { Email } from "./domains/auth/domain/value-objects/email.vo";

const result = Email.create("user@example.com");
// Result<Email, InvalidEmail>

if (result.isOk()) {
  const email = result.unwrap();
  console.log(email.value); // "user@example.com"
}
```

Validates against a simplified RFC-5321 regex. Returns `InvalidEmail` on failure.

### Password Value Object

```typescript
import { Password } from "./domains/auth/domain/value-objects/password.vo";

const result = Password.create("securepass1");
// Result<Password, DomainError>
```

Validates: minimum 8 characters, at least one non-alphabetic character.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `InvalidEmail` | Email fails format validation | `Invalid email address: "<value>"` |
| `InvalidCredentials` | Password does not match hash | `Invalid email or password` |
| `UserNotFound` | No user found for the given ID | `User not found with id: "<id>"` |
| `UserAlreadyExists` | Email is already registered | `User already exists with email: "<email>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `UserRegistered` | `RegisterUser` use case | `userId`, `email`, `occurredAt` |

## Application Layer

### Use Cases

#### RegisterUser

Registers a new user. Checks for duplicate email, hashes the password, persists the user, and emits a `UserRegistered` event.

```typescript
import { RegisterUser } from "./domains/auth/application/use-cases/register-user.use-case";

const registerUser = new RegisterUser(userRepository, passwordHasher);

const result = await registerUser.execute({
  email: "user@example.com",
  password: "securepass1",
});
// Result<{ userId: string; event: UserRegistered }, Error>
```

**Possible failures**: `UserAlreadyExists`, `InvalidEmail`

#### LoginUser

Authenticates a user by email and password. Returns a signed token on success. Optionally accepts `organizationId` to include the active organization in the token.

```typescript
import { LoginUser } from "./domains/auth/application/use-cases/login-user.use-case";

const loginUser = new LoginUser(userRepository, tokenService, passwordHasher);

const result = await loginUser.execute({
  email: "user@example.com",
  password: "securepass1",
  organizationId: "org-1", // optional — includes org context in token
});
// Result<{ token: string; userId: string }, Error>
```

**Possible failures**: `InvalidCredentials`, `UserNotFound`

### Port Interfaces

#### IUserRepository

```typescript
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
```

#### IPasswordHasher

```typescript
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
```

#### ITokenService

```typescript
export interface ITokenService {
  generate(userId: string, roles: string[], organizationId?: string): Promise<string>;
  verify(token: string): Promise<{ userId: string; organizationId?: string } | null>;
}
```

When `organizationId` is provided to `generate()`, the token includes the active organization context. The `verify()` method returns the `organizationId` if present in the token, enabling tenant-scoped downstream middleware.

## Public API (contracts/)

```typescript
import { createAuthService, IAuthService } from "./domains/auth/contracts";

const authService: IAuthService = createAuthService({
  userRepository,
  passwordHasher,
  tokenService,
});

// IAuthService interface:
// register(input: AuthRegisterInput): Promise<Result<{ userId: string }, Error>>
// login(input: AuthLoginInput): Promise<Result<AuthLoginOutput, Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## File Map

```
domains/auth/
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
```
