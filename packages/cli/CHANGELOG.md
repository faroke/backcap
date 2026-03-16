# @backcap/cli

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
