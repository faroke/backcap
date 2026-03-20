---
title: Configuration
description: Complete reference for the backcap.json configuration file.
---

The `backcap.json` file is created by `backcap init` at the root of your project. It tells the CLI where to write files and which framework you use.

## Example

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
    "shared": "src/shared"
  }
}
```

## Fields

### `framework`

The backend framework for your project. Used to select the right adapters when running `backcap add`.

| Value | Detected from |
|-------|---------------|
| `express` | `express` in `package.json` |
| `fastify` | `fastify` in `package.json` |
| `hono` | `hono` in `package.json` |
| `nestjs` | `@nestjs/core` in `package.json` |
| `nextjs` | `next` in `package.json` |

Auto-detected during `backcap init`. If detection fails, you are prompted to choose.

### `packageManager`

The package manager used for installing dependencies.

| Value | Detected from |
|-------|---------------|
| `npm` | `package-lock.json` |
| `pnpm` | `pnpm-lock.yaml` |
| `yarn` | `yarn.lock` |
| `bun` | `bun.lockb` |

Auto-detected during `backcap init`. If detection fails, you are prompted to choose.

### `alias`

**Default:** `"@domains"`

The TypeScript path alias for cross-domain imports. During `backcap init`, the CLI adds a corresponding entry to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@domains/*": ["domains/*"]
    }
  }
}
```

This lets capabilities import from each other using clean paths:

```typescript
import type { ITokenService } from "@domains/auth/application/ports/token-service.port.js";
```

instead of fragile relative paths.

:::caution
Changing the alias after installation requires a manual find-and-replace across your codebase. The CLI does not migrate existing imports.
:::

### `paths`

Controls where the CLI writes files when you run `backcap add`. All paths are relative to your project root.

| Field | Default | Description |
|-------|---------|-------------|
| `paths.domains` | `"domains"` | Domain source files — entities, use cases, contracts, value objects |
| `paths.adapters` | `"adapters"` | Adapter implementations — Express routers, Prisma repositories, etc. |
| `paths.bridges` | `"bridges"` | Bridge files — event-driven connections between capabilities |
| `paths.skills` | `".claude/skills"` | AI agent skill files (SKILL.md and references) |
| `paths.shared` | `"src/shared"` | Shared utilities — `Result` type, event bus port, base bridge class |

#### Customizing paths

You can edit `backcap.json` directly after init:

```json
{
  "paths": {
    "domains": "src/domains",
    "adapters": "src/adapters",
    "bridges": "src/bridges",
    "skills": ".claude/skills",
    "shared": "src/shared"
  }
}
```

The CLI will use these paths for all subsequent `backcap add` commands. Existing files are not moved — only new installations use the updated paths.

## Design notes

- **No state tracking.** Unlike tools that maintain a lock file, `backcap.json` contains only configuration. The filesystem is the source of truth for what is installed — run `backcap list` to see installed capabilities.
- **Strict paths.** Unknown keys inside `paths` are rejected during validation to catch typos early.
- **Extensible top level.** Unknown keys at the top level are allowed for forward compatibility.
