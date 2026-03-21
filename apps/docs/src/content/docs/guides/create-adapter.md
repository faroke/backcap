---
title: Create an Adapter
description: Step-by-step guide for writing a custom persistence or framework adapter.
---

An adapter implements a port interface defined by a domain's application layer. This guide covers creating both a persistence adapter (for a database) and an HTTP adapter (for a framework). We'll use the `auth` domain as the example.

## Which Port Do You Need to Implement?

Open the domain's `application/ports/` directory to see what interfaces are available:

```
src/domains/auth/application/ports/
  user-repository.port.ts    # IUserRepository
  password-hasher.port.ts    # IPasswordHasher
  token-service.port.ts      # ITokenService
```

Each port file contains a TypeScript interface. Your adapter must satisfy that interface completely.

## Creating a Persistence Adapter

### Example: MongoDB User Repository

**Step 1 — Create the adapter file**

```
src/adapters/persistence/mongodb/auth/user-repository.adapter.ts
```

**Step 2 — Import the port interface and domain entity**

```typescript
import type { IUserRepository } from "../../../../domains/auth/application/ports/user-repository.port";
import { User } from "../../../../domains/auth/domain/entities/user.entity";
```

The adapter imports the interface (to satisfy the contract) and the domain entity (to translate between the database model and the domain model).

**Step 3 — Define the database record type**

```typescript
interface MongoUserRecord {
  _id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

This type is internal to the adapter. The domain entity knows nothing about MongoDB field names.

**Step 4 — Implement the interface**

```typescript
export class MongoUserRepository implements IUserRepository {
  constructor(private readonly collection: Collection<MongoUserRecord>) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.collection.findOne({ email });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.collection.findOne({ _id: id });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const record = this.toMongo(user);
    await this.collection.insertOne(record);
  }

  private toDomain(record: MongoUserRecord): User {
    return User.create({
      id: record._id,
      email: record.email,
      passwordHash: record.passwordHash,
      roles: record.roles,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }).unwrap(); // Safe: data from DB is trusted
  }

  private toMongo(user: User): MongoUserRecord {
    return {
      _id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

**Step 5 — Write an integration test**

```typescript
// src/adapters/persistence/mongodb/auth/__tests__/user-repository.adapter.test.ts
describe("MongoUserRepository", () => {
  let repository: MongoUserRepository;
  // Setup: connect to a test MongoDB instance

  it("saves and retrieves a user by email", async () => {
    const user = User.create({
      id: "test-id",
      email: "test@example.com",
      passwordHash: "hash",
    }).unwrap();

    await repository.save(user);
    const found = await repository.findByEmail("test@example.com");

    expect(found).not.toBeNull();
    expect(found!.email.value).toBe("test@example.com");
  });

  it("returns null for a missing user", async () => {
    const found = await repository.findByEmail("missing@example.com");
    expect(found).toBeNull();
  });
});
```

**Step 6 — Wire it into your container**

```typescript
// src/container.ts
import { createAuthService } from "./domains/auth/contracts";
import { MongoUserRepository } from "./adapters/persistence/mongodb/auth/user-repository.adapter";

export const authService = createAuthService({
  userRepository: new MongoUserRepository(db.collection("users")),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(secret),
});
```

## Creating an HTTP Adapter

### Example: Fastify Auth Routes

**Step 1 — Create the adapter file**

```
src/adapters/http/fastify/auth/auth.routes.ts
```

**Step 2 — Import the contracts layer**

HTTP adapters depend on the domain's public contract, not on internal use cases:

```typescript
import type { IAuthService } from "../../../../domains/auth/contracts";
import { UserAlreadyExists } from "../../../../domains/auth/domain/errors/user-already-exists.error";
import { InvalidCredentials } from "../../../../domains/auth/domain/errors/invalid-credentials.error";
import { InvalidEmail } from "../../../../domains/auth/domain/errors/invalid-email.error";
```

**Step 3 — Implement the routes**

```typescript
import type { FastifyInstance } from "fastify";

export async function registerAuthRoutes(
  app: FastifyInstance,
  authService: IAuthService,
): Promise<void> {
  app.post("/auth/register", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const result = await authService.register({ email, password });

    if (result.isFail()) {
      const error = result.unwrapError();
      if (error instanceof UserAlreadyExists) {
        return reply.status(409).send({ error: error.message });
      }
      if (error instanceof InvalidEmail) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: "Internal server error" });
    }

    return reply.status(201).send(result.unwrap());
  });

  app.post("/auth/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const result = await authService.login({ email, password });

    if (result.isFail()) {
      const error = result.unwrapError();
      if (error instanceof InvalidCredentials) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }
      return reply.status(500).send({ error: "Internal server error" });
    }

    return reply.status(200).send(result.unwrap());
  });
}
```

**Step 4 — Register with Fastify**

```typescript
// src/app.ts
import Fastify from "fastify";
import { registerAuthRoutes } from "./adapters/http/fastify/auth/auth.routes";
import { authService } from "./container";

const app = Fastify();
await registerAuthRoutes(app, authService);
```

## Adapter Rules

| Rule | Why |
|---|---|
| Implement the port interface exactly (use `implements`) | TypeScript will catch missing methods at compile time |
| Import from `application/ports/` for the interface, `domain/` for entities | Never import `contracts/` in an adapter |
| Keep database record types private to the adapter file | The domain model must not depend on DB column names |
| Call `Result.unwrap()` only on trusted data (e.g., data from your own DB) | Unwrapping with untrusted data can throw |
| Write integration tests that use real infrastructure | The adapter is the boundary — test it with the real thing |

## Checklist

- [ ] Port interface identified in `application/ports/`
- [ ] Adapter file created in `src/adapters/<category>/<technology>/<domain>/`
- [ ] Class implements the port interface with the `implements` keyword
- [ ] `toDomain()` and `toStorage()` mappers written (for persistence adapters)
- [ ] Integration test written
- [ ] Adapter wired into the factory call in `src/container.ts`
