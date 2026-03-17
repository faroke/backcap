# @backcap/shared

## 0.2.0

### Minor Changes

- 057992d: Add cross-capability bridges with event bus pattern

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
  - `backcap list` — browse available capabilities from the registry
  - `backcap add` — install capabilities with conflict detection and selective installation
  - `backcap bridges` — view bridge information between capabilities
