---
title: Adapters
description: How adapters implement port interfaces to connect capabilities to real infrastructure.
---

An **adapter** is a concrete implementation of a port interface. Ports are defined in the `application/` layer of a capability as TypeScript interfaces — they describe what the capability needs from the outside world (a database, a hash function, a token signer) without saying anything about how those things work. Adapters provide the "how".

This is the ports and adapters pattern from hexagonal architecture. The capability domain and use cases are kept completely isolated from infrastructure concerns by programming only against the interface.

## The Port / Adapter Relationship

A capability defines a port interface:

```typescript
// src/capabilities/auth/application/ports/user-repository.port.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
```

An adapter implements that interface for a specific technology:

```typescript
// src/adapters/prisma/auth/user-repository.adapter.ts
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = this.toPrisma(user);
    await this.prisma.user.create({ data });
  }

  private toDomain(record: PrismaUserRecord): User {
    return User.create({ ...record }).unwrap();
  }

  private toPrisma(user: User): PrismaUserRecord {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
```

## Adapter Categories

Backcap ships two types of adapters:

### Persistence Adapters

Persistence adapters implement repository port interfaces. They translate between the domain entity model and the storage model.

The Prisma adapter for auth (`auth-prisma`) provides `PrismaUserRepository`. It maps `User` domain entities to and from Prisma's record format, keeping Prisma-specific types entirely inside the adapter.

**Import rule**: Persistence adapters import from `application/` ports (for the interface type) and `domain/` entities (for mapping). They never import from `contracts/`.

### HTTP / Framework Adapters

HTTP adapters connect the capability's public service interface to a framework's routing layer.

The Express adapter for auth (`auth-express`) provides `createAuthRouter()` and an authentication middleware:

```typescript
// src/adapters/express/auth/auth.router.ts
export function createAuthRouter(authService: IAuthService, router: Router): Router {
  router.post("/auth/register", async (req, res) => {
    const result = await authService.register(req.body);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(201).json(result.unwrap());
  });

  router.post("/auth/login", async (req, res) => {
    const result = await authService.login(req.body);

    if (result.isFail()) {
      const { status, message } = toHttpError(result.unwrapError());
      res.status(status).json({ error: message });
      return;
    }

    res.status(200).json(result.unwrap());
  });

  return router;
}
```

The `toHttpError()` helper maps typed domain errors to HTTP status codes:

| Domain Error | HTTP Status |
|---|---|
| `UserAlreadyExists` | `409 Conflict` |
| `InvalidCredentials` | `401 Unauthorized` |
| `UserNotFound` | `401 Unauthorized` |
| `InvalidEmail` | `400 Bad Request` |
| Unexpected error | `500 Internal Server Error` |

## Directory Structure

Adapters live outside the capability directory:

```
src/
  capabilities/
    auth/              # Capability source (domain, application, contracts)
  adapters/
    prisma/
      auth/
        user-repository.adapter.ts
        __tests__/
          user-repository.adapter.test.ts
    express/
      auth/
        auth.router.ts
        auth.middleware.ts
        __tests__/
```

This separation enforces the import rules: the capability code can never accidentally import from an adapter.

## Installing Adapters

Adapters are installed with the `backcap add` command, the same as capabilities:

```bash
npx backcap add auth-prisma
npx backcap add auth-express
```

The CLI detects which adapters are compatible with your project based on the packages in your `package.json`, and may offer to install compatible adapters automatically when you add a capability.

## Writing Your Own Adapter

To write a custom adapter:

1. Identify the port interface you want to implement (in `application/ports/`)
2. Create a new file in `src/adapters/<technology>/<capability>/`
3. Implement the interface with your technology of choice
4. Wire it into the `createAuthService()` factory call in your container

See the [Create an Adapter guide](/guides/create-adapter) for a step-by-step walkthrough.

## Why This Matters

Because the use cases only depend on port interfaces, you can:

- **Swap databases**: Replace `PrismaUserRepository` with a `MongoUserRepository` without touching any use case code
- **Test in isolation**: Use in-memory mock implementations in tests without needing a real database
- **Support multiple frameworks**: Run the same auth logic behind Express, Fastify, or Next.js API routes by swapping the HTTP adapter

The capability logic is stable; the adapters are interchangeable.
