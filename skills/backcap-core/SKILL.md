---
name: backcap-core
description: >
  Backcap is a DDD capability registry and CLI for TypeScript backends. Each capability follows
  strict Clean Architecture layers: domain (entities, value objects, domain errors, domain events),
  application (use cases, ports as interfaces, DTOs), contracts (public factory + service interface,
  the only barrel index.ts), and adapters (framework/persistence implementations). The Result<T,E>
  monad replaces exceptions for expected failures. Ports define interfaces; adapters implement them.
  Bridges are cross-capability use cases that wire two or more capabilities together. The CLI
  (backcap init, backcap list, backcap add, backcap bridges, backcap add bridge) scaffolds
  capabilities and adapters into user projects by fetching JSON bundles from the registry.
  File naming uses kebab-case with typed suffixes. Domain has zero external imports. DI is
  constructor-injection; createXxxService factory functions in contracts/ wire the object graph.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-core

Backcap is a **capability registry and CLI** for TypeScript backends. It ships production-ready
Domain-Driven Design (DDD) modules — called *capabilities* — that teams install with a single
command. Each capability is self-contained, framework-agnostic, and follows strict layering rules.

## Overview

A Backcap **capability** is a vertical slice of backend logic composed of four layers:

| Layer | Responsibility | Import rule |
|---|---|---|
| `domain/` | Entities, value objects, domain errors, domain events | No external imports; no framework code |
| `application/` | Use cases, port interfaces, DTOs | Imports `domain/` only |
| `contracts/` | Public service interface + factory function | Imports `application/` ports and use cases |
| `adapters/` | Framework and persistence implementations | Implements `application/` ports |

A **bridge** is a standalone module that wires two or more capabilities together (e.g.
`auth-notifications` listens to `UserRegistered` from `auth` and calls a `notifications`
port to send a welcome email).

The `shared/result.ts` file inside each capability holds the `Result<T, E>` monad used for
typed error handling without exceptions.

## Domain Map

```
capabilities/
  <name>/
    domain/
      entities/          # Aggregate roots and entities (.entity.ts)
      value-objects/     # Immutable validated wrappers (.vo.ts)
      errors/            # Typed domain errors (.error.ts)
      events/            # Domain events emitted by use cases (.event.ts)
      __tests__/         # Co-located unit tests for domain objects
    application/
      use-cases/         # Orchestration classes (.use-case.ts)
      ports/             # Port interfaces for infrastructure (.port.ts)
      dto/               # Plain data transfer objects (.dto.ts)
      __tests__/         # Co-located unit tests; mocks/ and fixtures/ sub-dirs
    contracts/
      index.ts           # The ONLY barrel export in the capability
      <name>.contract.ts # Public service interface (.contract.ts)
      <name>.factory.ts  # createXxxService DI factory (.factory.ts)
    shared/
      result.ts          # Result<T,E> monad (copied per capability)

adapters/
  <framework>/
    <name>/              # Implements application/ ports (.adapter.ts)
  <orm>/
    <name>/

bridges/
  <name>/
    contracts/
      index.ts           # Barrel for bridge public surface
      <name>.contract.ts
    domain/events/       # Re-exported or mirrored domain events
    use-cases/           # Bridge orchestration use cases
    dto/
    errors/
    shared/result.ts
    __tests__/
```

## Extension Guide

### Adding a new use case to an existing capability

1. Create `application/use-cases/<verb>-<noun>.use-case.ts` — export a class with an `execute`
   method returning `Promise<Result<Output, Error>>`.
2. If the use case needs a new infrastructure dependency, add a port interface in
   `application/ports/<name>.port.ts`.
3. Add an input DTO in `application/dto/<verb>-<noun>-input.dto.ts` if the input is non-trivial.
4. Wire the use case into `contracts/<name>.factory.ts` — inject the new port via the
   `XxxServiceDeps` type and the `createXxxService` factory.
5. Expose any new public types from `contracts/index.ts`.
6. Write a co-located test in `application/__tests__/<verb>-<noun>.use-case.test.ts` with mocks
   in `application/__tests__/mocks/`.

### Adding a new entity or value object

1. Place entities in `domain/entities/<name>.entity.ts`; value objects in
   `domain/value-objects/<name>.vo.ts`.
2. Use a `private constructor` and a `static create(...)` factory that returns `Result<Self, Error>`.
3. Domain objects must not import from `application/` or `contracts/`.
4. Add a typed error class in `domain/errors/<name>.error.ts` with a `static create(...)` factory.

### Adding an adapter

1. Create `adapters/<framework>/<capability>/<name>.adapter.ts`.
2. Implement the port interface from `application/ports/`.
3. Import only from `capabilities/<name>/application/ports/` and `capabilities/<name>/domain/`.
4. Do not export from a barrel; adapters are wired by the consuming application.

## Conventions

See [`references/conventions.md`](references/conventions.md) for the full conventions reference.

Key rules:
- **File naming**: kebab-case with typed suffix (`.entity.ts`, `.use-case.ts`, `.vo.ts`, etc.)
- **`index.ts` barrel rule**: `index.ts` exists ONLY in `contracts/` and bridge `contracts/`.
  No barrel files anywhere else.
- **Result pattern**: use `Result<T, E>` for all expected failures. Never `throw` in use cases.
- **Zero-dependency guarantee**: `domain/` imports nothing outside itself and `shared/result.ts`.
- **DI pattern**: constructor injection only. `createXxxService(deps)` wires the graph in
  `contracts/`.
- **Test co-location**: tests live in `__tests__/` inside the layer they test, not in a top-level
  `tests/` folder.

## Available Bridges

| Bridge | Connects | Description |
|---|---|---|
| `auth-notifications` | `auth` | Listens to `UserRegistered` and sends a welcome email via an `IEmailSender` port |

Install a bridge with: `npx @backcap/cli add bridge auth-notifications`

See [`references/capability-index.md`](references/capability-index.md) for the full capability
and bridge catalogue.

## CLI Commands

| Command | Description |
|---|---|
| `npx @backcap/cli init` | Scaffold `backcap.json` config in the current project; auto-detects framework and package manager |
| `npx @backcap/cli list` | Fetch and display all available capabilities from the registry |
| `npx @backcap/cli add <name>` | Install a capability (e.g. `npx @backcap/cli add auth`); detects adapters, resolves conflicts, writes files, installs npm deps |
| `npx @backcap/cli bridges` | List bridges that are compatible with currently installed capabilities |
| `npx @backcap/cli add bridge <name>` | Install a specific bridge into the project |

Default registry URL: `https://faroke.github.io/backcap`

Config file written to `backcap.json` with default paths:

```json
{
  "paths": {
    "capabilities": "src/capabilities",
    "adapters":     "src/adapters",
    "bridges":      "src/bridges",
    "skills":       "src/skills",
    "shared":       "src/shared"
  }
}
```
