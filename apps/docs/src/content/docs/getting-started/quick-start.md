---
title: Quick Start
description: Step-by-step guide to installing and using the auth capability.
---

This guide walks you through adding the `auth` capability to an existing TypeScript project. By the end you will have a working user registration and login system with typed errors, port interfaces, and a Prisma adapter — all in your repository.

## Step 1 — Initialize Backcap

If you have not already initialized Backcap in your project:

```bash
npx backcap init
```

Accept the detected framework and package manager, or select them manually. A `backcap.json` file will be created in your project root.

## Step 2 — Add the Auth Capability

```bash
npx backcap add auth
```

The CLI will:

1. Fetch the `auth` capability bundle from the registry
2. Check for any file conflicts with your existing codebase
3. Ask you to confirm the installation
4. Write the capability source files to `src/capabilities/auth/`
5. Install any required npm dependencies
6. Record `auth` in your `backcap.json`

### What Gets Written

```
src/capabilities/auth/
  domain/
    entities/
      user.entity.ts        # User aggregate root
    value-objects/
      email.vo.ts           # Email with RFC-5321 validation
      password.vo.ts        # Password with strength validation
    errors/
      invalid-email.error.ts
      invalid-credentials.error.ts
      user-not-found.error.ts
      user-already-exists.error.ts
    events/
      user-registered.event.ts
  application/
    use-cases/
      register-user.use-case.ts
      login-user.use-case.ts
    ports/
      user-repository.port.ts   # IUserRepository interface
      password-hasher.port.ts   # IPasswordHasher interface
      token-service.port.ts     # ITokenService interface
    dto/
      register-input.dto.ts
      login-input.dto.ts
      login-output.dto.ts
  contracts/
    auth.contract.ts            # IAuthService interface
    auth.factory.ts             # createAuthService() factory
    index.ts
  shared/
    result.ts                   # Result<T, E> monad
```

## Step 3 — Implement the Port Interfaces

The `auth` capability defines three port interfaces that you must implement. These are the seams between the capability logic and your infrastructure:

### IUserRepository

```typescript
// src/capabilities/auth/application/ports/user-repository.port.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
```

If you are using Prisma, install the Prisma adapter:

```bash
npx backcap add auth-prisma
```

This writes `src/adapters/prisma/auth/user-repository.adapter.ts` — a `PrismaUserRepository` class that implements `IUserRepository`.

### IPasswordHasher

Implement this interface using `bcrypt` or `argon2`:

```typescript
// src/adapters/my-app/password-hasher.adapter.ts
import bcrypt from "bcrypt";
import type { IPasswordHasher } from "../../capabilities/auth/application/ports/password-hasher.port";

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
```

### ITokenService

Implement using `jsonwebtoken` or any JWT library:

```typescript
// src/adapters/my-app/token-service.adapter.ts
import jwt from "jsonwebtoken";
import type { ITokenService } from "../../capabilities/auth/application/ports/token-service.port";

export class JwtTokenService implements ITokenService {
  constructor(private readonly secret: string) {}

  async sign(payload: { userId: string }): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: "7d" });
  }

  async verify(token: string): Promise<{ userId: string }> {
    return jwt.verify(token, this.secret) as { userId: string };
  }
}
```

## Step 4 — Wire the Service

Use the `createAuthService` factory from the contracts layer to assemble the service:

```typescript
// src/container.ts
import { createAuthService } from "./capabilities/auth/contracts";
import { PrismaUserRepository } from "./adapters/prisma/auth/user-repository.adapter";
import { BcryptPasswordHasher } from "./adapters/my-app/password-hasher.adapter";
import { JwtTokenService } from "./adapters/my-app/token-service.adapter";
import { prisma } from "./lib/prisma"; // your Prisma client

export const authService = createAuthService({
  userRepository: new PrismaUserRepository(prisma),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(process.env.JWT_SECRET!),
});
```

## Step 5 — Use the Service

Call the service from your route handlers or controllers:

```typescript
// Registration
const result = await authService.register({
  email: "user@example.com",
  password: "securepassword1",
});

if (result.isFail()) {
  const error = result.unwrapError();
  // error is typed: UserAlreadyExists | InvalidEmail | Error
  console.error(error.message);
  return;
}

const { userId } = result.unwrap();

// Login
const loginResult = await authService.login({
  email: "user@example.com",
  password: "securepassword1",
});

if (loginResult.isOk()) {
  const { token, userId } = loginResult.unwrap();
}
```

## Step 6 — Add the Express Router (Optional)

If you are using Express, install the Express adapter:

```bash
npx backcap add auth-express
```

Then register the router:

```typescript
import express from "express";
import { Router } from "express";
import { createAuthRouter } from "./adapters/express/auth/auth.router";
import { authService } from "./container";

const app = express();
app.use(express.json());

const router = new Router();
createAuthRouter(authService, router);
app.use(router);
```

This adds `POST /auth/register` and `POST /auth/login` routes with proper HTTP status code mapping.

## Next Steps

- Read the [Auth capability reference](/capabilities/auth) for the full API
- Learn about the [Result pattern](/concepts/capabilities#the-result-pattern)
- Explore [Bridges](/concepts/bridges) to connect auth with notifications
- See how to [create your own capability](/guides/create-capability)
