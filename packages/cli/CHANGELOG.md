# @backcap/cli

## 0.3.0

### Minor Changes

- 057992d: Add cross-capability bridges with event bus pattern

  - auth-audit-log bridge subscribes to UserRegistered and LoginSucceeded events
  - blog-search bridge now indexes post content field
  - blog-comments bridge uses correct SendNotification interface (channel, recipient, subject, body)
  - CLI `backcap bridges` reads local bridge.json manifests instead of remote registry
  - Shared package exports event-bus, in-memory-event-bus, bridge, and bridge-catalog types

### Patch Changes

- 1c738e7: Add analytics, forms, comments and tags capabilities with Prisma and Express adapters, documentation, and AI skills
- Updated dependencies [057992d]
  - @backcap/shared@0.2.0

## 0.2.2

### Patch Changes

- adc2323: Add feature-flags and audit-log capabilities with Prisma and Express adapters, documentation, and AI skills
- e908998: Add webhooks and queues capabilities with Prisma and Express adapters

## 0.2.1

### Patch Changes

- 207b0fc: Add files and notifications capabilities with Prisma and Express adapters

## 0.2.0

### Minor Changes

- Add --yes/-y flag to init and add commands for non-interactive mode

## 0.1.5

### Patch Changes

- Fix registry fetch URLs to include /dist/ path prefix

## 0.1.4

### Patch Changes

- Fix registry URLs to use GitHub Pages where JSON files are actually served

## 0.1.3

### Patch Changes

- Fix workspace:\* dependency not being resolved during publish

## 0.1.2

### Patch Changes

- Fix registry URLs to point to faroke.github.io/backcap and update CLI command references to npx @backcap/cli
- Updated dependencies
  - @backcap/shared@0.1.2

## 0.1.0

### Minor Changes

- e81b550: Initial public release of the Backcap CLI and shared package.

  - `backcap init` — initialize a project with framework/package-manager detection
  - `backcap list` — browse available capabilities from the registry
  - `backcap add` — install capabilities with conflict detection and selective installation
  - `backcap bridges` — view bridge information between capabilities

### Patch Changes

- Updated dependencies [e81b550]
  - @backcap/shared@0.1.0
