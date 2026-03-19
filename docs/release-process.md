# Release Process

## Overview

Backcap uses [Changesets](https://github.com/changesets/changesets) to manage versioning, changelogs, and npm publishing across the monorepo.

**Published packages:** `@backcap/cli`, `@backcap/registry`, `@backcap/shared`
**Ignored packages:** `@backcap/docs` (not published to npm)

## Step-by-step

### 1. Create a changeset alongside your feature

After implementing a feature or fix, create a changeset file:

```bash
npx changeset
```

Or manually create a `.changeset/<name>.md` file:

```markdown
---
"@backcap/registry": minor
---

Short description of what changed and why.
```

Version bump types:
- **patch** — bug fix, no new API
- **minor** — new feature, backward-compatible
- **major** — breaking change

### 2. Commit your code + changeset

```bash
git add .
git commit -m "feat(registry): description (story X.Y)"
```

### 3. Version the packages

Consumes all pending changeset files, bumps `package.json` versions, and generates `CHANGELOG.md` entries.

```bash
npx changeset version
```

Review the changes, then commit:

```bash
git add .
git commit -m "chore: version packages"
```

### 4. Push

```bash
git push --follow-tags
```

### 5. Publish to npm

```bash
npx changeset publish
```

This publishes all packages whose local version is ahead of npm, and creates git tags (`@backcap/registry@0.1.0`, etc.).

Push the tags:

```bash
git push --follow-tags
```

## Quick reference

```bash
# Full release flow
npx changeset                  # 1. create changeset
git add . && git commit        # 2. commit code + changeset
npx changeset version          # 3. bump versions + changelog
git add . && git commit        # 4. commit version bump
git push                       # 5. push commits
npx changeset publish          # 6. publish to npm + create tags
git push --follow-tags         # 7. push tags
```

## Configuration

- **Config:** `.changeset/config.json`
- **Ignore list:** packages that changeset will skip (currently `@backcap/docs`)
- **Access:** `public` (scoped packages published as public)
- **Base branch:** `main`

## Troubleshooting

### "Found mixed changeset" error

A changeset references both ignored and non-ignored packages. Fix: ensure each changeset only references packages in the same ignore category.

### Package not publishing

Check that the package does **not** have `"private": true` in its `package.json` and is **not** in the `ignore` list in `.changeset/config.json`.
