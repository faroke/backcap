---
title: Prisma Adapter
description: Prisma ORM implementations for Backcap domain repositories.
---

The Prisma adapter package provides persistence implementations for Backcap domain port interfaces using [Prisma ORM](https://www.prisma.io/). Each adapter implements a repository port interface and translates between the domain entity model and Prisma's record types.

## Install

Install the Prisma adapter for a specific domain:

```bash
npx @backcap/cli add auth-prisma
```

## auth-prisma

### What Gets Written

```
src/adapters/prisma/auth/
  user-repository.adapter.ts      # PrismaUserRepository
  __tests__/
    user-repository.adapter.test.ts
```

### PrismaUserRepository

`PrismaUserRepository` implements `IUserRepository` from the `auth` domain.

```typescript
import { PrismaUserRepository } from "./adapters/prisma/auth/user-repository.adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
```

**Implemented methods:**

| Method | SQL Operation |
|---|---|
| `findByEmail(email)` | `SELECT * FROM users WHERE email = ?` |
| `findById(id)` | `SELECT * FROM users WHERE id = ?` |
| `save(user)` | `INSERT INTO users VALUES (?)` |

### Required Prisma Schema

Add the following model to your `prisma/schema.prisma`:

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

Run the Prisma migration after adding the schema:

```bash
npx prisma migrate dev --name auth
```

### Mapping Between Domain and Prisma

The adapter uses two private methods to translate between the domain model and Prisma's record type:

**`toDomain(record)`** — called when reading from the database. Uses `User.create()` with the database values. Since data from your own database is trusted, `unwrap()` is called directly.

```typescript
private toDomain(record: PrismaUserRecord): User {
  return User.create({
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    roles: record.roles,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }).unwrap(); // Safe: data from DB is trusted
}
```

**`toPrisma(user)`** — called when writing to the database. Extracts the `.value` from value objects (e.g., `user.email.value`) and maps to the Prisma record shape.

```typescript
private toPrisma(user: User): PrismaUserRecord {
  return {
    id: user.id,
    email: user.email.value,  // .value unwraps the Email value object
    passwordHash: user.passwordHash,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
```

### Wiring into createAuthService

```typescript
// src/container.ts
import { createAuthService } from "./domains/auth/contracts";
import { PrismaUserRepository } from "./adapters/prisma/auth/user-repository.adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authService = createAuthService({
  userRepository: new PrismaUserRepository(prisma),
  passwordHasher: yourPasswordHasher,
  tokenService: yourTokenService,
});
```

## Writing Additional Prisma Adapters

When a new domain is added that requires a persistence adapter, follow these steps:

1. Create the file at `src/adapters/prisma/<domain>/<entity>-repository.adapter.ts`
2. Import the port interface from `../../domains/<domain>/application/ports/`
3. Import the domain entity from `../../domains/<domain>/domain/entities/`
4. Implement the interface with `class Prisma<Entity>Repository implements I<Entity>Repository`
5. Write `toDomain()` and `toPrisma()` mapping methods
6. Add the corresponding model to `prisma/schema.prisma`
7. Write an integration test

See the [Create an Adapter guide](/backcap/guides/create-adapter) for a detailed walkthrough.

## Domain Support

19 out of 20 domains ship with Prisma adapters. The `search` domain has no Prisma adapter because it defines its own search-engine port instead.

## Testing

The Prisma adapter tests use mock `PrismaClient` objects (via `vi.fn()`) to test the repository logic in isolation — no real database is required:

```typescript
// src/adapters/prisma/auth/__tests__/user-repository.adapter.test.ts
function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

const dbRecord = {
  id: "user-1",
  email: "test@example.com",
  passwordHash: "hashed",
  roles: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaUserRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaUserRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaUserRepository(prisma);
  });

  it("findByEmail returns user when found", async () => {
    prisma.user.findUnique.mockResolvedValue(dbRecord);
    const user = await repo.findByEmail("test@example.com");
    expect(user).not.toBeNull();
    expect(user!.email.value).toBe("test@example.com");
  });

  it("save persists user via prisma.user.create", async () => {
    prisma.user.create.mockResolvedValue(dbRecord);
    const user = User.create({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed",
    }).unwrap();

    await repo.save(user);
    expect(prisma.user.create).toHaveBeenCalledOnce();
  });
});
```

## Dependencies

The Prisma adapter has no runtime dependency on the `@prisma/client` package in the adapter source itself — it accepts the Prisma client via constructor injection. This means the adapter works with any version of Prisma that satisfies the inferred interface shape.

You will need `@prisma/client` and `prisma` in your project dependencies:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```
