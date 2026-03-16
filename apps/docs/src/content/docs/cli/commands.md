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
    "skills": "src/skills",
    "shared": "src/shared"
  },
  "installed": []
}
```

**Detected frameworks:**

| `package.json` dependency | Detected framework |
|---|---|
| `next` | `next` |
| `express` | `express` |
| `fastify` | `fastify` |
| `@nestjs/core` | `nestjs` |

**Detected package managers** (by lockfile presence):

| Lockfile | Package manager |
|---|---|
| `pnpm-lock.yaml` | `pnpm` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm` |

---

## backcap add

Install a capability from the registry.

```bash
npx @backcap/cli add <capability>
```

**Arguments:**

| Argument | Required | Description |
|---|---|---|
| `capability` | Yes | The name of the capability to install (e.g., `auth`, `blog`) |

**What it does:**

1. Verifies that `backcap.json` exists (exits with an error if not)
2. Loads the configuration from `backcap.json`
3. Fetches the capability JSON bundle from `https://faroke.github.io/backcap/dist/<capability>.json`
4. Detects which adapters in the bundle are compatible with your `package.json`
5. Runs conflict detection against your existing files:
   - If all incoming files are identical to existing files, exits early (nothing to do)
   - If there are no conflicts, proceeds directly to the install prompt
   - If there are conflicts, shows a summary and offers three options:
     - **Abort** — cancel the installation, no files written
     - **Install at a different path** — prompts for a new path
     - **Compare and continue** — shows detailed diffs, then proceeds
6. Prompts for final confirmation before writing files
7. Writes capability source files to `<paths.capabilities>/<capability>/`
8. Installs npm dependencies listed in the capability bundle
9. Updates `backcap.json` to record the installed capability

**Example:**

```bash
npx @backcap/cli add auth
# Fetching auth...
# No conflicts detected.
# Install auth? › Yes
# Capability files written to src/capabilities/auth
# Installing dependencies: zod
# auth installed successfully!
```

**Conflict resolution options:**

When the CLI detects files that differ from what is already on disk:

```
Conflicts detected:
  ~ src/capabilities/auth/domain/entities/user.entity.ts (modified)

How would you like to proceed?
  › Abort installation
    Install at a different path
    Compare changes and continue
```

---

## backcap list

Browse available capabilities from the registry.

```bash
npx @backcap/cli list
```

**What it does:**

1. Loads `backcap.json` if it exists (to know which capabilities are already installed)
2. Fetches the registry catalog from `https://faroke.github.io/backcap/registry.json`
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
2. Loads the list of installed capabilities from `backcap.json`
3. Fetches the bridge catalog from `https://faroke.github.io/backcap/dist/bridges/index.json`
4. Filters bridges to show only those whose dependencies are all installed in the current project
5. Displays compatible bridges with their description, dependencies, and installation status

**Example output:**

```
Available Bridges

  auth-notifications — Sends a welcome email on UserRegistered
    Dependencies: auth, notifications | Status: available

  auth-audit — Records login and registration events to the audit log
    Dependencies: auth, audit-log | Status: installed
```

If no capabilities are installed, the command suggests running `backcap add <capability>` first.

If no compatible bridges are found (because the required capability pairs are not both installed), the command suggests installing more capabilities.

---

## Global Options

All commands support these options:

| Option | Description |
|---|---|
| `--help`, `-h` | Show help text for the command |
| `--version`, `-v` | Show the CLI version |

---

## Error Handling

The CLI uses a consistent error format. Errors are displayed with a red cross prefix and a descriptive message:

```
✖ No backcap.json found. Run `backcap init` first.
✖ Could not fetch capability "auth" from registry.
✖ Invalid capability data received from registry.
```

Common errors and their solutions:

| Error | Solution |
|---|---|
| `No backcap.json found` | Run `npx @backcap/cli init` first |
| `Could not fetch capability from registry` | Check your internet connection; verify the capability name with `backcap list` |
| `Invalid capability data` | The registry may be temporarily unavailable; try again |
| `Could not fetch bridge catalog` | Check your internet connection |

---

## Registry URL

By default, the CLI fetches from `https://faroke.github.io/backcap`. This is not currently configurable via flags but can be customized by editing the source (if you have the registry source locally for development purposes).
