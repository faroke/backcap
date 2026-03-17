# Auth Capability — Domain Map

Complete file-by-file reference for the `auth` capability.

---

## Directory Tree

```
capabilities/auth/
  domain/
    entities/
      user.entity.ts
    value-objects/
      email.vo.ts
      password.vo.ts
    errors/
      invalid-credentials.error.ts
      invalid-email.error.ts
      user-already-exists.error.ts
      user-not-found.error.ts
    events/
      user-registered.event.ts
    __tests__/
      user.entity.test.ts
      email.vo.test.ts
      password.vo.test.ts
      errors.test.ts
      user-registered.event.test.ts
  application/
    use-cases/
      register-user.use-case.ts
      login-user.use-case.ts
    ports/
      user-repository.port.ts
      password-hasher.port.ts
      token-service.port.ts
    dto/
      register-input.dto.ts
      login-input.dto.ts
      login-output.dto.ts
    __tests__/
      register-user.use-case.test.ts
      login-user.use-case.test.ts
      mocks/
        user-repository.mock.ts
        password-hasher.mock.ts
        token-service.mock.ts
      fixtures/
        user.fixture.ts
  contracts/
    auth.contract.ts
    auth.factory.ts
    index.ts
  shared/
    result.ts

adapters/
  express/auth/
    auth.router.ts
    auth.middleware.ts
    __tests__/
      auth.router.test.ts
      auth.middleware.test.ts
  prisma/auth/
    user-repository.adapter.ts
    auth.schema.prisma
    __tests__/
      user-repository.adapter.test.ts

bridges/
  auth-notifications/
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

---

## Domain Layer

### `domain/entities/user.entity.ts`

**Export**: `User`

The `User` aggregate root. All fields are `readonly`. The constructor is `private`; use
`User.create(params)` to construct instances.

```typescript
class User {
  readonly id: string
  readonly email: Email         // value object, not raw string
  readonly passwordHash: string
  readonly roles: string[]
  readonly createdAt: Date
  readonly updatedAt: Date

  static create(params: {
    id: string
    email: string         // validated into Email VO
    passwordHash: string
    roles?: string[]      // defaults to ["user"]
    createdAt?: Date
    updatedAt?: Date
  }): Result<User, InvalidEmail>

  updateEmail(newEmail: string): Result<User, InvalidEmail>
}
```

`roles` defaults to `["user"]` when omitted.

---

### `domain/value-objects/email.vo.ts`

**Export**: `Email`

Immutable wrapper for a validated email address. Validates against an RFC-5321-simplified
regex: `local-part@domain`, no consecutive dots, proper TLD structure.

```typescript
class Email {
  readonly value: string
  static create(value: string): Result<Email, InvalidEmail>
}
```

---

### `domain/value-objects/password.vo.ts`

**Export**: `Password`, `DomainError`

Immutable wrapper for a plaintext password before hashing. Validates:
- Minimum 8 characters.
- At least one non-alphabetic character.

```typescript
class Password {
  readonly value: string
  static create(value: string): Result<Password, DomainError>
}
```

Note: `Password` holds the **plaintext** value before hashing. It is only used during
registration input validation; it is never persisted.

---

### `domain/errors/invalid-email.error.ts`

**Export**: `InvalidEmail extends Error`

```typescript
static create(email: string): InvalidEmail
// message: `Invalid email address: "${email}"`
```

---

### `domain/errors/invalid-credentials.error.ts`

**Export**: `InvalidCredentials extends Error`

```typescript
static create(): InvalidCredentials
// message: "Invalid email or password"
```

Returned by `LoginUser` for both "user not found" and "wrong password" to prevent user
enumeration. The `name` property is `"InvalidCredentials"`.

---

### `domain/errors/user-not-found.error.ts`

**Export**: `UserNotFound extends Error`

```typescript
static create(userId: string): UserNotFound
// message: `User not found with id: "${userId}"`
```

Used internally by `LoginUser` before converting to `InvalidCredentials`.

---

### `domain/errors/user-already-exists.error.ts`

**Export**: `UserAlreadyExists extends Error`

```typescript
static create(email: string): UserAlreadyExists
// message: `User already exists with email: "${email}"`
```

Returned by `RegisterUser` when `IUserRepository.findByEmail` finds an existing user.

---

### `domain/events/user-registered.event.ts`

**Export**: `UserRegistered`

Plain class (no base class dependency).

```typescript
class UserRegistered {
  readonly userId:     string
  readonly email:      string
  readonly occurredAt: Date   // defaults to new Date()

  constructor(userId: string, email: string, occurredAt?: Date)
}
```

Returned inside the `RegisterUser` result payload so callers can forward it to bridges or
a message bus.

---

## Application Layer

### `application/ports/user-repository.port.ts`

**Export**: `IUserRepository`

```typescript
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
}
```

---

### `application/ports/password-hasher.port.ts`

**Export**: `IPasswordHasher`

```typescript
interface IPasswordHasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hash: string): Promise<boolean>
}
```

---

### `application/ports/token-service.port.ts`

**Export**: `ITokenService`

```typescript
interface ITokenService {
  generate(userId: string, roles: string[]): Promise<string>
  verify(token: string): Promise<{ userId: string } | null>
}
```

Returns `null` from `verify` when the token is invalid or expired.

---

### `application/dto/register-input.dto.ts`

**Export**: `RegisterInput`

```typescript
interface RegisterInput {
  email: string
  password: string
}
```

---

### `application/dto/login-input.dto.ts`

**Export**: `LoginInput`

```typescript
interface LoginInput {
  email: string
  password: string
}
```

---

### `application/dto/login-output.dto.ts`

**Export**: `LoginOutput`

```typescript
interface LoginOutput {
  token: string
  userId: string
}
```

---

### `application/use-cases/register-user.use-case.ts`

**Export**: `RegisterUser`

Constructor dependencies: `IUserRepository`, `IPasswordHasher`.

```typescript
execute(input: RegisterInput):
  Promise<Result<{ userId: string; event: UserRegistered }, Error>>
```

Flow:
1. Check `IUserRepository.findByEmail` — fail with `UserAlreadyExists` if found.
2. Hash password via `IPasswordHasher.hash`.
3. Generate UUID with `crypto.randomUUID()`.
4. Build `User` via `User.create` — fail with `InvalidEmail` if email is invalid.
5. Persist via `IUserRepository.save`.
6. Return `{ userId, event: UserRegistered }`.

---

### `application/use-cases/login-user.use-case.ts`

**Export**: `LoginUser`

Constructor dependencies: `IUserRepository`, `ITokenService`, `IPasswordHasher`.

```typescript
execute(input: LoginInput): Promise<Result<LoginOutput, Error>>
```

Flow:
1. Look up user by email — fail with `InvalidCredentials` if not found (not `UserNotFound`,
   to prevent enumeration).
2. Verify password via `IPasswordHasher.compare` — fail with `InvalidCredentials` if wrong.
3. Generate token via `ITokenService.generate(userId, roles)`.
4. Return `{ token, userId }`.

---

## Contracts Layer

### `contracts/auth.contract.ts`

**Exports**: `IAuthService`, `AuthRegisterInput`, `AuthLoginInput`, `AuthLoginOutput`

```typescript
interface IAuthService {
  register(input: AuthRegisterInput): Promise<Result<{ userId: string }, Error>>
  login(input: AuthLoginInput): Promise<Result<AuthLoginOutput, Error>>
}
```

---

### `contracts/auth.factory.ts`

**Export**: `createAuthService(deps: AuthServiceDeps): IAuthService`

```typescript
type AuthServiceDeps = {
  userRepository: IUserRepository
  tokenService:   ITokenService
  passwordHasher: IPasswordHasher
}
```

---

### `contracts/index.ts`

The single barrel for the capability. Import everything from here:

```typescript
import { createAuthService, type IAuthService } from './capabilities/auth/contracts'
```

---

## Adapters

### `adapters/express/auth/auth.router.ts`

**Export**: `createAuthRouter(authService: IAuthService, router: Router): Router`

Routes:

| Method | Path | Success | Errors |
|---|---|---|---|
| `POST` | `/auth/register` | 201 `{ userId }` | 400 InvalidEmail, 409 UserAlreadyExists, 500 |
| `POST` | `/auth/login` | 200 `{ token, userId }` | 401 InvalidCredentials / UserNotFound, 500 |

Error mapping via `toHttpError(error)` — converts domain errors to HTTP status codes.

---

### `adapters/express/auth/auth.middleware.ts`

**Export**: `createAuthMiddleware(tokenService: ITokenService): RequestHandler`

Reads `Authorization: Bearer <token>` header, verifies via `ITokenService.verify`, and sets
`req.user = { userId }` on success. Returns 401 on missing header or invalid token.

---

### `adapters/prisma/auth/user-repository.adapter.ts`

**Export**: `PrismaUserRepository implements IUserRepository`

Accepts a `PrismaClient`-shaped object (typed locally; no `@prisma/client` import in source,
keeping the file infrastructure-agnostic at the type level). Converts between Prisma records
and `User` domain entities via private `toDomain` / `toPrisma` methods.

---

### `adapters/prisma/auth/auth.schema.prisma`

Prisma model fragment to merge into `schema.prisma`:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  roles        String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

After merging: `npx prisma migrate dev --name auth && npx prisma generate`.

---

## Shared

### `shared/result.ts`

**Export**: `Result<T, E extends Error>`

The `Result` monad. Copied into each capability so the domain and application layers have
zero npm dependencies. Methods: `ok`, `fail`, `isOk`, `isFail`, `unwrap`, `unwrapError`, `map`.
