---
title: Prisma Adapter
description: Prisma ORM implementations for Backcap capability repositories.
---

The Prisma adapter package provides persistence implementations for Backcap capability port interfaces using [Prisma ORM](https://www.prisma.io/). Each adapter implements a repository port interface and translates between the domain entity model and Prisma's record types.

## Install

Install the Prisma adapter for a specific capability:

```bash
npx backcap add auth-prisma
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

`PrismaUserRepository` implements `IUserRepository` from the `auth` capability.

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
  id           String   @id
  email        String   @unique
  passwordHash String
  roles        String[]
  createdAt    DateTime
  updatedAt    DateTime
}
```

Run the Prisma migration after adding the schema:

```bash
npx prisma migrate dev --name add-users
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
import { createAuthService } from "./capabilities/auth/contracts";
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

When a new capability is added that requires a persistence adapter, follow these steps:

1. Create the file at `src/adapters/prisma/<capability>/<entity>-repository.adapter.ts`
2. Import the port interface from `../../capabilities/<capability>/application/ports/`
3. Import the domain entity from `../../capabilities/<capability>/domain/entities/`
4. Implement the interface with `class Prisma<Entity>Repository implements I<Entity>Repository`
5. Write `toDomain()` and `toPrisma()` mapping methods
6. Add the corresponding model to `prisma/schema.prisma`
7. Write an integration test

See the [Create an Adapter guide](/guides/create-adapter) for a detailed walkthrough.

## Testing

The Prisma adapter test file uses a real Prisma client pointed at a test database. It tests:

- Saving a new user succeeds
- Finding a user by email returns the correct domain entity
- Finding by ID returns the correct domain entity
- Finding a missing email returns `null`

```typescript
// src/adapters/prisma/auth/__tests__/user-repository.adapter.test.ts
describe("PrismaUserRepository", () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } },
    });
    repository = new PrismaUserRepository(prisma);
  });

  afterAll(() => prisma.$disconnect());
  afterEach(() => prisma.user.deleteMany());

  it("saves and retrieves a user by email", async () => {
    const user = User.create({
      id: "test-id",
      email: "test@example.com",
      passwordHash: "hash",
    }).unwrap();

    await repository.save(user);
    const found = await repository.findByEmail("test@example.com");

    expect(found).not.toBeNull();
    expect(found!.id).toBe("test-id");
    expect(found!.email.value).toBe("test@example.com");
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
