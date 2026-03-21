---
title: Introduction
description: What Backcap is, how it works, and why it exists.
---

Backcap is a **registry of composable backend domains for TypeScript**. It lets you install production-ready backend features — authentication, search, blog, payments, notifications — the same way you install npm packages, with full source code dropped directly into your project.

## The Problem

Every backend project rebuilds the same features from scratch:

- User authentication and session management
- Role-based permissions
- Blog and content management
- Full-text search
- Notification delivery
- Billing and subscription logic

This costs weeks of engineering time and produces duplicated logic across every project you touch. The logic itself is not novel — but its implementation is fragile, untested, and tied to whichever framework you happened to use.

## The Backcap Model

Backcap is inspired by [shadcn/ui](https://ui.shadcn.com/): instead of installing an opaque library you cannot modify, you install **source code** that lives in your repository. You own every file. You can read it, adapt it, delete it.

The CLI fetches a domain from the registry and writes its files into your project under a path you control (default: `src/domains/`). From that point forward, the code is yours.

```bash
npx @backcap/cli add auth
# Writes source to src/domains/auth/
# Installs required npm packages
# Records the domain in backcap.json
```

## Clean Architecture at the Core

Every Backcap domain is structured in four strict layers:

| Layer | Contents |
|---|---|
| `domain/` | Entities, value objects, domain errors, domain events |
| `application/` | Use cases, port interfaces, DTOs |
| `contracts/` | Public service interface and factory function |
| `adapters/` | Framework and persistence implementations |

The `domain/` and `application/` layers have **zero external npm dependencies**. All framework and persistence concerns live in adapters, which implement the port interfaces defined in the application layer. This is the hexagonal architecture pattern — sometimes called ports and adapters.

## The Result Pattern

Backcap domains do not throw errors for expected failure conditions. Every use case and factory method returns a `Result<T, E>` monad:

```typescript
const userResult = User.create({ id, email, passwordHash });

if (userResult.isFail()) {
  const error = userResult.unwrapError(); // typed as InvalidEmail
  // handle the failure
}

const user = userResult.unwrap(); // safe — only reached if isOk()
```

This makes error handling explicit, typed, and impossible to forget.

## Framework Agnostic

Backcap domains work with any TypeScript runtime and framework:

- **Runtimes**: Node.js, Bun, Deno
- **Frameworks**: Express, Fastify, Hono, Next.js, NestJS, or any HTTP layer

The core domain and application code has no framework imports. Framework integration is handled by the adapter layer, which you install separately.

## Value Proposition

- **Speed**: Add a production-grade auth system in under a minute
- **Ownership**: Full source code in your repository — no magic, no black boxes
- **Correctness**: Every domain ships with tests and typed error handling
- **Adaptability**: Swap persistence layers or frameworks by swapping adapters
- **AI-friendly**: Clear layer separation and typed contracts make AI tooling effective
