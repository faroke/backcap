# Backcap Demo

A complete demo project showing how Backcap capabilities compose together.

## Capabilities Used

- **auth** — User registration and login
- **blog** — Blog post creation and publishing
- **search** — Full-text search indexing and querying

## Bridge

- **blog-search** — Automatically indexes published blog posts for search when a `PostPublished` event fires

## Architecture

```
src/
  adapters/           # In-memory implementations of port interfaces
  shared/             # Event bus for bridge wiring
  main.ts             # Demo flow: register → login → create → publish → search
  demo.test.ts        # Integration test covering the full flow
```

## Run

```bash
# From the monorepo root
pnpm --filter @backcap/demo start

# Run tests
pnpm --filter @backcap/demo test
```

## What This Demonstrates

1. **Pure DI** — Each capability's service is wired with explicit adapter injections, no DI container
2. **Event-driven bridges** — The blog-search bridge subscribes to `PostPublished` and indexes the post
3. **Port/adapter pattern** — All infrastructure is behind port interfaces, easily swappable
4. **Clean Architecture** — Domain logic has zero dependencies on infrastructure

## Production Adapters

Replace the in-memory adapters with real implementations:

| Port | Demo Adapter | Production Adapter |
|---|---|---|
| `IUserRepository` | `InMemoryUserRepository` | `PrismaUserRepository` (`backcap add auth-prisma`) |
| `IPasswordHasher` | `SimplePasswordHasher` | `BcryptPasswordHasher` |
| `ITokenService` | `SimpleTokenService` | `JwtTokenService` |
| `IPostRepository` | `InMemoryPostRepository` | `PrismaPostRepository` |
| `ISearchEngine` | `InMemorySearchEngine` | `MeilisearchEngine` / `AlgoliaEngine` |

For more information, visit the [Backcap documentation](https://backcap.dev).
