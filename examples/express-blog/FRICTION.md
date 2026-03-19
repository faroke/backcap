# Friction Log — Express Blog Example

## Friction Point 1: Package manager detection fails in monorepo subdirectories

**Step:** `backcap init -y`
**Error:** `Cannot detect package manager. Run without --yes or create backcap.json manually.`
**Root cause:** `detectPackageManager()` only checks the CWD for lockfiles, not parent directories. In a monorepo, the lockfile is at the root.
**Fix applied:** Updated `packages/cli/src/detection/package-manager.ts` to walk up parent directories until a lockfile is found.

## Friction Point 2: `add bridge blog-search` syntax doesn't work

**Step:** `backcap add bridge blog-search`
**Error:** `Could not fetch "bridge" from registry.`
**Root cause:** The CLI interprets "bridge" as the item name (positional arg). There is no `bridge` sub-command — the CLI auto-detects bridge vs capability by trying both registry paths.
**Fix applied:** None needed in code — the correct syntax is `backcap add blog-search`. Updated documentation/example to reflect correct usage.

## Friction Point 3: Template comments cause false conflicts on reinstall

**Step:** `backcap add blog -y` (second run after installing Prisma adapter)
**Error:** Conflict report shows 6 "modified" files with only `// Template:` comment differences.
**Root cause:** Conflict detection compares raw registry content (with `{{shared_path}}` markers) against installed files (with resolved paths). The `// Template:` comments aren't resolved before comparison.
**Fix applied:** Added `resolveFileMarkers()` in `packages/cli/src/lib/write-capability.ts` and updated `packages/cli/src/commands/add.ts` to resolve template markers before conflict detection.

## Friction Point 4: Bridge imports reference non-existent shared paths

**Step:** Wire bridge in `src/server.ts`
**Error:** TypeScript error — `../../../shared/src/event-bus.port.js` and `../../../shared/src/bridge.js` don't exist.
**Root cause:** Bridge files reference `IEventBus` and `Bridge` interfaces from `@backcap/shared`, but the installed bridge has hardcoded relative paths that don't resolve in the user's project structure. The template system doesn't handle these imports.
**Fix applied:** Manually created `src/shared/event-bus.port.ts`, `src/shared/bridge.ts`, and `src/shared/in-memory-event-bus.ts`. Fixed bridge imports to point to `../../shared/`.

## Friction Point 5: Blog factory discards domain events

**Step:** Wire bridge with blog service
**Error:** Bridge never receives `PostPublished` events because the factory's `publishPost()` maps away the event.
**Root cause:** `createBlogService()` wraps use cases with `.map(v => v.output)`, discarding the domain events. The bridge needs these events to function.
**Fix applied:** In the example, we use the use cases directly instead of the factory, and manually publish events to the event bus after successful operations.

## Friction Point 6: Adapter imports have wrong relative paths

**Step:** TypeScript compilation
**Error:** `Cannot find module '../../../capabilities/blog/...'` — off by one directory level.
**Root cause:** Adapters are installed with a category directory (e.g., `http/` or `persistence/`) making them one level deeper than the hardcoded relative imports expect. The template system only resolves `{{shared_path}}`, not capability cross-references.
**Fix applied:** Manually corrected imports in `blog.router.ts` and `post-repository.adapter.ts` to use `../../../../capabilities/...` (4 levels up instead of 3).

## Friction Point 7: IndexDocument use case requires pre-existing index

**Step:** Search after publishing a post
**Error:** `Search index not found: "posts"`
**Root cause:** Both `IndexDocument` and `SearchDocuments` use cases check `indexExists()` before operating. Since the InMemorySearchEngine creates indices lazily in `indexDocument()`, the use case's own guard prevents the first document from being indexed.
**Fix applied:** Bridge wiring uses `searchEngine.indexDocument()` directly instead of the `IndexDocument` use case, bypassing the existence check.

## Friction Point 8: Prisma v7 requires driver adapter

**Step:** `new PrismaClient()`
**Error:** `Expected 1 arguments, but got 0.`
**Root cause:** Prisma v7 requires an explicit driver adapter (e.g., `PrismaLibSql`, `PrismaPg`). The Backcap Prisma adapter's type interface uses its own `PrismaClient` interface that doesn't reflect this.
**Fix applied:** Installed `@prisma/adapter-libsql` and `@libsql/client`, configured `PrismaLibSql` adapter in server.ts.
