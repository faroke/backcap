<h1 align="center">Backcap</h1>

<p align="center">
  <strong>Production-ready backend domains, scaffolded as source code.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@backcap/cli"><img src="https://img.shields.io/npm/v/@backcap/cli?label=%40backcap%2Fcli&color=18181b" alt="npm version" /></a>
  <a href="https://faroke.github.io/backcap/"><img src="https://img.shields.io/badge/docs-online-blue?color=18181b" alt="Documentation" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-18181b" alt="Node >= 18" />
</p>

<br />

Backcap is a **domain registry and CLI** for TypeScript backends. Instead of installing opaque npm packages, you scaffold real source code — clean architecture, fully typed, ready to own and extend.

```bash
npx @backcap/cli init
npx @backcap/cli add auth
```

That's it. You get a complete authentication module with entities, use cases, ports, DTOs, and an AI skill file — all wired into your project. You implement the adapters on the exposed ports.

---

## Why Backcap?

Most backend starters give you a monolith to fork or a library to depend on. Backcap takes a different approach:

- **Source code, not packages** — Every domain lands in your `src/` as plain TypeScript. No vendor lock-in, no black boxes.
- **Clean Architecture by default** — Domain, Application, Contracts. Each layer has strict import rules enforced by convention.
- **Framework-agnostic** — Works with Express, Fastify, NestJS, Next.js, or any Node/Bun/Deno runtime. You implement adapters on the ports exposed by each domain.
- **AI-native** — Each domain ships with a SKILL.md file that gives your AI assistant full context on the architecture, file map, and rules.

## Domains

20 production-ready domains, each following the same clean architecture:

| Domain | Description |
|---|---|
| **auth** | Registration, login, JWT tokens, password hashing |
| **users** | User profiles, preferences, and address management |
| **rbac** | Role-based access control |
| **organizations** | Multi-tenant organization management |
| **audit-log** | Immutable audit trail |
| **activity** | User activity tracking, feeds, and timelines |
| **blog** | Posts, drafts, publishing workflow |
| **comments** | Threaded comments with moderation |
| **reviews** | Customer reviews with moderation and aggregated ratings |
| **tags** | Tagging system with relationships |
| **files** | File upload, storage, metadata |
| **forms** | Dynamic form builder and submissions |
| **notifications** | Multi-channel notification dispatch |
| **catalog** | Product catalog and inventory |
| **inventory** | Stock management across warehouses with reservations |
| **cart** | Shopping cart management |
| **orders** | Order processing and fulfillment |
| **discounts** | Promotions, coupon codes, and discount rules |
| **shipping** | Shipment lifecycle, carriers, and rate calculation |
| **billing** | Payments, subscriptions, invoicing |

## Architecture

Every domain follows the same 3-layer structure:

```
domains/auth/
  domain/           # Entities, value objects, errors, events — zero external imports
  application/      # Use cases, ports (interfaces), DTOs — depends only on domain
  contracts/        # Public API: factory function + service interface — the only index.ts
  shared/           # Local utilities (Result re-export, etc.)
```

Key principles:
- **`Result<T, E>`** replaces exceptions for all expected failures
- **Ports** define interfaces; **you implement the adapters**
- **DI** via constructor injection — a single `createXxxService(deps)` factory wires everything
- **Domain has zero imports** — pure TypeScript, no frameworks, no libraries

## CLI

```bash
npx @backcap/cli init          # Initialize a project — detects framework & package manager
npx @backcap/cli list          # List all available domains
npx @backcap/cli add <name>    # Scaffold a domain into your project
```

The CLI handles conflict resolution, dependency installation, and skill file placement — all interactively.

## AI Skills

Backcap domains ship with structured SKILL.md files designed for AI coding assistants. Load them to give your AI full architectural context:

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
npx @backcap/cli init

# 2. Add domains
npx @backcap/cli add auth
npx @backcap/cli add blog

# 3. Implement your adapters on the exposed ports and start building
```

## Project Structure

```
backcap/
  packages/
    cli/              # @backcap/cli — the scaffolding tool
    registry/         # Domain source code & build pipeline
    shared/           # Shared types, schemas, Result monad
  apps/
    docs/             # Documentation site (faroke.github.io/backcap)
  skills/             # AI skill files for skills.sh
```

## Documentation

Full documentation at **[faroke.github.io/backcap](https://faroke.github.io/backcap/)** — guides, concepts, API reference, and a step-by-step tutorial for creating your own domains.

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
