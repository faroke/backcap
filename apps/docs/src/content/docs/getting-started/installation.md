---
title: Installation
description: Prerequisites, initializing a project, and understanding backcap.json.
---

Backcap is a CLI tool that scaffolds backend capabilities into your existing TypeScript project. There is nothing to install globally — you run it with `npx`.

## Prerequisites

- **Node.js** 18 or later (or Bun / Deno with Node compatibility)
- A TypeScript project with a `package.json`
- One of the following package managers: `npm`, `pnpm`, or `yarn`

## Initialize Your Project

Run `backcap init` in the root of your TypeScript project:

```bash
npx @backcap/cli init
```

The CLI will:

1. Detect your framework automatically (Next.js, Express, Fastify, NestJS)
2. Detect your package manager (npm, pnpm, yarn)
3. Prompt you to confirm or override the detected values
4. Write a `backcap.json` configuration file

If a `backcap.json` already exists, the CLI will show the existing configuration and ask whether you want to overwrite it.

## The backcap.json Configuration File

After running `init`, a `backcap.json` is written to your project root:

```json
{
  "framework": "express",
  "packageManager": "pnpm",
  "paths": {
    "capabilities": "src/capabilities",
    "adapters": "src/adapters",
    "bridges": "src/bridges",
    "skills": "src/skills",
    "shared": "src/shared"
  },
  "installed": []
}
```

### Configuration Fields

| Field | Description |
|---|---|
| `framework` | The detected or selected framework identifier |
| `packageManager` | The package manager used to install dependencies |
| `paths.capabilities` | Where capability source files are written |
| `paths.adapters` | Where adapter source files are written |
| `paths.bridges` | Where bridge source files are written |
| `paths.skills` | Where agent skill files are written |
| `paths.shared` | Where shared utilities (like `Result`) are written |
| `installed` | List of capability names installed in this project |

### Customizing Paths

You can edit `backcap.json` manually to change any output path. The CLI reads this file before writing any files, so all subsequent `backcap add` commands will respect your custom paths.

For example, to place capabilities under `lib/capabilities` instead of `src/capabilities`:

```json
{
  "paths": {
    "capabilities": "lib/capabilities"
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

If no framework is detected, the CLI prompts you to select one from a list.

## What Comes Next

Once your project is initialized, install your first capability:

```bash
npx @backcap/cli add auth
```

See the [Quick Start](/getting-started/quick-start) guide for a step-by-step walkthrough.
