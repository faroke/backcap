---
title: Installation
description: Prerequisites, initializing a project, and understanding backcap.json.
---

Backcap is a CLI tool that scaffolds backend capabilities into your existing TypeScript project. There is nothing to install globally — you run it with `npx`.

## Prerequisites

- **Node.js** 18 or later (or Bun / Deno with Node compatibility)
- A TypeScript project with a `package.json`
- One of the following package managers: `npm`, `pnpm`, `yarn`, or `bun`

## Initialize Your Project

Run `backcap init` in the root of your TypeScript project:

```bash
npx @backcap/cli init
```

The CLI will:

1. Detect your framework automatically (Next.js, Express, Fastify, Hono, NestJS)
2. Detect your package manager (npm, pnpm, yarn, bun)
3. Prompt you to confirm or override the detected values
4. Write a `backcap.json` configuration file
5. Configure a `@domains/*` path alias in your `tsconfig.json`

If a `backcap.json` already exists, the CLI will show the existing configuration and ask whether you want to overwrite it.

## The backcap.json Configuration File

After running `init`, a `backcap.json` is written to your project root:

```json
{
  "framework": "express",
  "packageManager": "pnpm",
  "alias": "@domains",
  "paths": {
    "domains": "domains",
    "adapters": "adapters",
    "bridges": "bridges",
    "skills": ".claude/skills",
    "shared": "shared"
  },
  "installed": {
    "capabilities": [],
    "bridges": []
  }
}
```

### Configuration Fields

| Field | Description |
|---|---|
| `framework` | The detected or selected framework identifier |
| `packageManager` | The package manager used to install dependencies |
| `alias` | The tsconfig path alias prefix for domains (default: `"@domains"`) |
| `paths.domains` | Where capability source files are written |
| `paths.adapters` | Where adapter source files are written |
| `paths.bridges` | Where bridge source files are written |
| `paths.skills` | Where agent skill files are written |
| `paths.shared` | Where shared utilities (like `Result`) are written |
| `installed` | Structured record of installed capabilities and bridges |

### Customizing Paths

You can edit `backcap.json` manually to change any output path. The CLI reads this file before writing any files, so all subsequent `backcap add` commands will respect your custom paths.

For example, to place domains under `lib/domains` instead of `domains`:

```json
{
  "paths": {
    "domains": "lib/domains"
  }
}
```

## Framework Detection

The `init` command inspects your `package.json` dependencies to detect the framework:

| Package | Detected As |
|---|---|
| `next` | `next` |
| `express` | `express` |
| `fastify` | `fastify` |
| `@nestjs/core` | `nestjs` |
| `hono` | `hono` |

If no framework is detected, the CLI prompts you to select one from a list.

## What Comes Next

Once your project is initialized, install your first capability:

```bash
npx @backcap/cli add auth
```

See the [Quick Start](/backcap/getting-started/quick-start) guide for a step-by-step walkthrough.
