# @backcap/shared

## 0.2.2

### Patch Changes

- 2da3d79: Remove adapters, bridges, examples, and demo — pivot to pure domain-centric architecture where domains only expose ports and users implement their own adapters.

## 0.2.1

### Patch Changes

- fix(shared): align published config schema with DX model pivot

  The published config schema still expected `paths.domains` and an `installed` tracking object,
  while the CLI already generates `paths.domains` after the DX model pivot. This mismatch caused
  `backcap add` to reject any config produced by `backcap init`.

  - Rename `paths.domains` to `paths.domains` in config schema
  - Remove `installed` / `installedSchema` (FR12 removal)
  - Update default alias from `@domains` (already correct)
  - Fix registry test fixture referencing `paths.domains`

## 0.2.0

### Minor Changes

- 057992d: Add cross-domain bridges with event bus pattern

  - auth-audit-log bridge subscribes to UserRegistered and LoginSucceeded events
  - blog-search bridge now indexes post content field
  - blog-comments bridge uses correct SendNotification interface (channel, recipient, subject, body)
  - CLI `backcap bridges` reads local bridge.json manifests instead of remote registry
  - Shared package exports event-bus, in-memory-event-bus, bridge, and bridge-catalog types

## 0.1.2

### Patch Changes

- Fix registry URLs to point to faroke.github.io/backcap and update CLI command references to npx @backcap/cli

## 0.1.0

### Minor Changes

- e81b550: Initial public release of the Backcap CLI and shared package.

  - `backcap init` — initialize a project with framework/package-manager detection
  - `backcap list` — browse available domains from the registry
  - `backcap add` — install domains with conflict detection and selective installation
  - `backcap bridges` — view bridge information between domains
