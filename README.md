<h1 align="center">Backcap</h1>

<p align="center">
  <strong>Production-ready backend capabilities, scaffolded as source code.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@backcap/cli"><img src="https://img.shields.io/npm/v/@backcap/cli?label=%40backcap%2Fcli&color=18181b" alt="npm version" /></a>
  <a href="https://faroke.github.io/backcap/"><img src="https://img.shields.io/badge/docs-online-blue?color=18181b" alt="Documentation" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-18181b" alt="Node >= 18" />
</p>

<br />

Backcap is a **capability registry and CLI** for TypeScript backends. Instead of installing opaque npm packages, you scaffold real source code — clean architecture, fully typed, ready to own and extend.

```bash
npx backcap init
npx backcap add auth
```

That's it. You get a complete authentication module with entities, use cases, ports, DTOs, adapters, and an AI skill file — all wired into your project.

---

## Why Backcap?

Most backend starters give you a monolith to fork or a library to depend on. Backcap takes a different approach:

- **Source code, not packages** — Every capability lands in your `src/` as plain TypeScript. No vendor lock-in, no black boxes.
- **Clean Architecture by default** — Domain, Application, Contracts, Adapters. Each layer has strict import rules enforced by convention.
- **Framework-agnostic** — Works with Express, Fastify, NestJS, Next.js, or any Node/Bun/Deno runtime. Adapters are swappable.
- **AI-native** — Each capability ships with a SKILL.md file that gives your AI assistant full context on the architecture, file map, and rules.

## Capabilities

13 production-ready capabilities, each following the same clean architecture:

| Capability | Description |
|---|---|
| **auth** | Registration, login, JWT tokens, password hashing |
| **blog** | Posts, drafts, publishing workflow |
| **comments** | Threaded comments with moderation |
| **search** | Full-text search with pluggable engines |
| **tags** | Tagging system with relationships |
| **files** | File upload, storage, metadata |
| **forms** | Dynamic form builder and submissions |
| **notifications** | Multi-channel notification dispatch |
| **analytics** | Event tracking and aggregation |
| **audit-log** | Immutable audit trail |
| **feature-flags** | Feature toggles with targeting rules |
| **queues** | Job queues with retry and scheduling |
| **webhooks** | Outbound webhook delivery and management |

## Architecture

Every capability follows the same 4-layer structure:

```
src/capabilities/auth/
  domain/           # Entities, value objects, errors, events — zero external imports
  application/      # Use cases, ports (interfaces), DTOs — depends only on domain
  contracts/        # Public API: factory function + service interface — the only index.ts
  shared/           # Local utilities (Result re-export, etc.)
```

```
src/adapters/
  persistence/prisma/auth/    # Prisma implementation of repository ports
  http/express/auth/          # Express routes calling the service contract
```

Key principles:
- **`Result<T, E>`** replaces exceptions for all expected failures
- **Ports** define interfaces; **adapters** implement them
- **DI** via constructor injection — a single `createXxxService(deps)` factory wires everything
- **Domain has zero imports** — pure TypeScript, no frameworks, no libraries

## Bridges

Bridges wire capabilities together through domain events:

| Bridge | Connects |
|---|---|
| `auth-audit-log` | Logs authentication events to the audit trail |
| `auth-notifications` | Sends welcome emails on registration |
| `blog-comments` | Attaches comments to blog posts |
| `blog-search` | Indexes blog posts for search |
| `blog-tags` | Adds tagging to blog posts |

```bash
npx backcap add blog-search
```

## CLI

```bash
npx backcap init          # Initialize a project — detects framework & package manager
npx backcap list          # List all available capabilities
npx backcap add <name>    # Scaffold a capability or bridge into your project
npx backcap bridges       # List bridges compatible with your installed capabilities
```

The CLI handles adapter detection, conflict resolution, dependency installation, and skill file placement — all interactively.

## AI Skills

Backcap capabilities ship with structured SKILL.md files designed for AI coding assistants. Load them to give your AI full architectural context:

```
Read skills/backcap-core/SKILL.md and skills/backcap-auth/SKILL.md,
then help me add a resetPassword use case.
```

The AI will know exactly which layer, which patterns, and which imports to use.

Skills are also available via [skills.sh](https://skills.sh):

```bash
npx skills add faroke/backcap
```

## Quick Start

```bash
# 1. Initialize your project
npx backcap init

# 2. Add capabilities
npx backcap add auth
npx backcap add blog

# 3. Wire them together
npx backcap add blog-tags

# 4. Implement your adapters and start building
```

## Project Structure

```
backcap/
  packages/
    cli/              # @backcap/cli — the scaffolding tool
    registry/         # Capability source code & build pipeline
    shared/           # Shared types, schemas, Result monad
  apps/
    docs/             # Documentation site (faroke.github.io/backcap)
  skills/             # AI skill files for skills.sh
```

## Documentation

Full documentation at **[faroke.github.io/backcap](https://faroke.github.io/backcap/)** — guides, concepts, API reference, and a step-by-step tutorial for creating your own capabilities.

## Contributing

```bash
git clone https://github.com/faroke/backcap.git
cd backcap
pnpm install
pnpm build
pnpm test
```

## License

MIT
