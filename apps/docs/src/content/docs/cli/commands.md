---
title: CLI Commands
description: Complete reference for all Backcap CLI commands.
---

The Backcap CLI is invoked with `npx @backcap/cli` (or `backcap` if installed globally). It is built with [citty](https://github.com/unjs/citty) and [clack](https://github.com/natemoo-re/clack).

## backcap init

Initialize a Backcap project in the current directory.

```bash
npx @backcap/cli init
```

**Options:**

| Option | Alias | Description |
|---|---|---|
| `--yes` | `-y` | Skip all prompts (non-interactive mode) |

**What it does:**

1. Detects your framework by inspecting `package.json` dependencies
2. Detects your package manager by looking for lockfiles
3. If detection succeeds, logs the detected values; otherwise prompts you to select them
4. Checks whether a `backcap.json` already exists
   - If it exists, shows the current config and asks whether to overwrite
   - If you decline, the command exits without making changes
5. Writes a `backcap.json` to the current directory

**Generated `backcap.json`:**

```json
{
  "framework": "express",
  "packageManager": "pnpm",
  "paths": {
    "capabilities": "src/capabilities",
    "adapters": "src/adapters",
    "bridges": "src/bridges",
    "skills": ".claude/skills",
    "shared": "src/shared"
  },
  "installed": {
    "capabilities": [],
    "bridges": []
  }
}
```

**Detected frameworks:**

| `package.json` dependency | Detected framework |
|---|---|
| `next` | `nextjs` |
| `@nestjs/core` | `nestjs` |
| `fastify` | `fastify` |
| `hono` | `hono` |
| `express` | `express` |

**Detected package managers** (by lockfile presence):

| Lockfile | Package manager |
|---|---|
| `bun.lockb` | `bun` |
| `pnpm-lock.yaml` | `pnpm` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm` |

---

## backcap add

Install a capability or bridge from the registry.

```bash
npx @backcap/cli add <name>
```

**Arguments:**

| Argument | Required | Description |
|---|---|---|
| `name` | Yes | The name of the capability or bridge to install (e.g., `auth`, `blog`, `auth-blog`) |

**Options:**

| Option | Alias | Description |
|---|---|---|
| `--yes` | `-y` | Skip all prompts (non-interactive mode) |

**What it does:**

1. Verifies that `backcap.json` exists (exits with an error if not)
2. Loads the configuration from `backcap.json`
3. Fetches the JSON bundle from `https://faroke.github.io/backcap/dist/<name>.json` (falls back to `dist/bridges/<name>.json` for bridges)
4. Detects which adapters in the bundle are compatible with your `package.json`
5. Runs conflict detection against your existing files:
   - If all incoming files are identical to existing files, exits early (nothing to do)
   - If there are no conflicts, proceeds directly to the install prompt
   - If there are conflicts, shows a summary and offers resolution options:
     - **Compare and continue** — shows detailed diffs, then overwrites all conflicting files
     - **Select files individually** — pick which files to write (capabilities only)
     - **Choose a different path** — prompts for a new base path (capabilities only)
     - **Abort installation** — cancel, no files written
6. Prompts for final confirmation before writing files
7. Writes source files to the appropriate directory (`capabilities/`, `bridges/`, or `adapters/`)
8. Installs npm dependencies listed in the bundle
9. Installs `peerDependencies` as devDependencies in a second install pass
10. Updates `backcap.json` to record the installed capability or bridge

**Example:**

```bash
npx @backcap/cli add auth
# Fetching auth...
# No conflicts detected.
# Install auth? › Yes
# Installing dependencies: zod
# Installing dev dependencies: @types/bcrypt
#
# auth v1.0.0 installed successfully!
#
#   Capability: src/capabilities/auth
#   Adapters:   auth-express, auth-prisma
#
#   Next steps:
#   1. Review the installed files in src/capabilities/auth/
#   2. Run the test suite to verify: npx vitest run
#   3. Check available bridges: backcap bridges
```

**Conflict resolution options:**

When the CLI detects files that differ from what is already on disk:

```
Conflicts detected:
  ~ src/capabilities/auth/domain/entities/user.entity.ts (modified)

How would you like to proceed?
  › Compare and continue (overwrite all)
    Select files individually
    Choose a different path
    Abort installation
```

---

## backcap list

Browse available capabilities from the registry.

```bash
npx @backcap/cli list
```

**What it does:**

1. Loads `backcap.json` if it exists (to know which capabilities are already installed)
2. Fetches the registry catalog from `https://faroke.github.io/backcap/dist/registry.json`
3. Renders a table of available capabilities with their name, description, type, and installation status

**Example output:**

```
Name             Description                          Type          Status
auth             User registration and login          capability    installed
blog             Blog post management                 capability    available
search           Full-text search                     capability    available
notifications    Email and push notifications         capability    available
auth-prisma      Prisma adapter for auth              adapter       available
auth-express     Express router for auth              adapter       available
```

---

## backcap bridges

List available bridges between installed capabilities.

```bash
npx @backcap/cli bridges
```

**What it does:**

1. Verifies that `backcap.json` exists
2. Reads all `bridge.json` manifests from your local `bridges/` directory
3. Displays each bridge with its source capability, target capability, subscribed events, and installation status

**Example output:**

```
Bridges

  auth-audit-log
    Source: auth | Target: audit-log
    Events: UserRegistered, LoginSucceeded | Status: installed

  blog-search
    Source: blog | Target: search
    Events: PostPublished | Status: available

  blog-comments
    Source: comments | Target: blog
    Events: CommentPosted | Status: installed
```

If no bridge manifests are found, the command displays "No bridges available."

---

## Global Options

All commands support this option:

| Option | Description |
|---|---|
| `--help`, `-h` | Show help text for the command |

The `--version` / `-v` flag is available on the root `backcap` command only (not on subcommands).

---

## Error Handling

The CLI uses a consistent error format. Errors are displayed with a red cross prefix and a descriptive message:

```
✖ No backcap.json found. Run `backcap init` first.
✖ Could not fetch "auth" from registry.
✖ Invalid data received from registry.
```

Common errors and their solutions:

| Error | Solution |
|---|---|
| `No backcap.json found` | Run `npx @backcap/cli init` first |
| `Could not fetch "<name>" from registry` | Check your internet connection; verify the name with `backcap list` |
| `Invalid data received from registry` | The registry may be temporarily unavailable; try again |
| `No bridges available` | Install capabilities first — bridges appear automatically between installed capabilities. |

---

## Registry URL

By default, the CLI fetches from `https://faroke.github.io/backcap`. This is not currently configurable via flags but can be customized by editing the source (if you have the registry source locally for development purposes).
