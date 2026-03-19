# Friction Analysis — Backcap Framework Examples (Epic 12)

Consolidated analysis of friction logs from the 5 framework blog examples built during Stories 12.1–12.5.

## Executive Summary

| Framework | Friction Points | Blockers | Annoyances | Polish | Resolved | Open |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|
| **NestJS** | 8 | 2 | 4 | 2 | 8 | 0 |
| **Express** | 8 | 3 | 3 | 2 | 8 | 0 |
| **Next.js** | 7 | 2 | 2 | 3 | 7 | 0 |
| **Hono** | 6 | 2 | 1 | 3 | 6 | 0 |
| **Fastify** | 4 | 2 | 1 | 1 | 4 | 0 |
| **TOTAL** | **33** | **11** | **11** | **11** | **33** | **0** |

All 33 friction points were resolved during stop-and-fix. No open blockers remain.

---

## Friction Categories

### 1. Bridge Import Paths — Shared Infrastructure Missing (5/5 frameworks)

**Category:** Import issue · **Severity:** Blocker · **Status:** Resolved (all 5 examples)

**Problem:** Bridge files reference `IEventBus` and `Bridge` interfaces at `../../shared/event-bus.port.js` and `../../shared/bridge.js`. These files don't exist — the CLI installs the bridge but doesn't create the shared infrastructure it depends on (`event-bus.port.ts`, `bridge.ts`, `in-memory-event-bus.ts`).

**Fix applied:** Manually created `src/shared/` directory with the three required files in each example.

**Recommended follow-up:**
- **Issue: CLI should scaffold `src/shared/` infrastructure when installing bridges.** The shared files are a required dependency of every bridge — they should be installed automatically.

---

### 2. Adapter Import Relative Paths Off-by-One (4/5 frameworks: Express, Fastify, Hono, NestJS)

**Category:** Import issue · **Severity:** Blocker · **Status:** Resolved (all 4 examples)

**Problem:** Adapters are installed under a category subdirectory (e.g., `adapters/http/express/blog/`, `adapters/persistence/prisma/blog/`), making them one level deeper than the hardcoded relative imports expect. Imports use `../../../capabilities/...` (3 levels) when they need `../../../../capabilities/...` (4 levels).

**Fix applied:** Manually corrected relative imports in adapter files.

**Recommended follow-up:**
- **Issue: Template system should resolve capability cross-references.** Currently it only resolves `{{shared_path}}` markers. It should also handle `{{capabilities_path}}` or use a consistent path strategy.

---

### 3. HTTP Adapters Not Yet Published (4/5 frameworks: Fastify, Hono, NestJS, Next.js)

**Category:** Adapter gap · **Severity:** Annoyance · **Status:** Resolved (adapters exist in registry source)

**Problem:** Framework-specific HTTP adapters exist in the registry source (`packages/registry/adapters/<framework>/blog/`) but haven't been published to the GitHub Pages registry. The CLI detects the framework and warns, but skips the adapter.

**Current state of registry adapters:**
- `express/` — Full coverage: 19 capabilities with HTTP adapters
- `fastify/` — Blog only
- `hono/` — Blog only
- `nestjs/` — Wiring guide only (no code adapter — by design)
- `nextjs/` — Blog only
- `prisma/` — Full coverage: 19 capabilities with persistence adapters

**Recommended follow-up:**
- **Issue: Publish adapters with next registry build+deploy.** All adapter source code is ready.
- **Issue: Expand Fastify/Hono/Next.js adapters** beyond blog to match Express coverage (19 capabilities).

---

### 4. Search Adapters Missing Entirely (2/5 frameworks: NestJS, Next.js — affects all)

**Category:** Adapter gap · **Severity:** Annoyance · **Status:** Resolved (manual in-memory implementation)

**Problem:** No search adapters exist in the registry (no `search-prisma`, no `search-express`, etc.). Each example had to manually implement `ISearchEngine` with a basic in-memory adapter.

**Recommended follow-up:**
- **Issue: Create search adapters** — at minimum: `search-prisma` (persistence) and HTTP adapters for each framework. Search is a core capability referenced on the landing page.

---

### 5. Prisma Schema Fragment — No Automated Merge (3/5 frameworks: Express, NestJS, Next.js)

**Category:** Wiring confusion · **Severity:** Annoyance · **Status:** Resolved (manual setup)

**Problem:** The CLI installs a `.schema.prisma` fragment with instructions to copy the model into a main schema. There's no `prisma/schema.prisma` file created, no generator configured, and no automated merge.

**Recommended follow-up:**
- **Issue: CLI `add` command should auto-merge Prisma fragments** into an existing `prisma/schema.prisma` or scaffold one if missing.

---

### 6. Blog Factory Discards Domain Events (1/5 frameworks: Express)

**Category:** Wiring confusion · **Severity:** Blocker · **Status:** Resolved

**Problem:** `createBlogService()` wraps use cases with `.map(v => v.output)`, discarding domain events. Bridges need these events to function.

**Fix applied:** Examples use use cases directly instead of factory, manually publishing events to the event bus.

**Recommended follow-up:**
- **Issue: Factory should preserve domain events.** Either change the factory to return full results (including events), or provide a factory variant that supports event forwarding.

---

### 7. IndexDocument Use Case Prevents First Document Indexing (1/5 frameworks: Express)

**Category:** Wiring confusion · **Severity:** Blocker · **Status:** Resolved

**Problem:** Both `IndexDocument` and `SearchDocuments` use cases call `indexExists()` before operating. InMemorySearchEngine creates indices lazily in `indexDocument()`, so the guard prevents the first document from ever being indexed.

**Fix applied:** Bridge wiring uses `searchEngine.indexDocument()` directly, bypassing the use case guard.

**Recommended follow-up:**
- **Issue: `IndexDocument` use case should auto-create the index** if it doesn't exist, or the InMemorySearchEngine should eagerly create indices.

---

### 8. Template Comment Conflicts on Reinstall (1/5 frameworks: Express)

**Category:** Missing CLI feature · **Severity:** Annoyance · **Status:** Resolved

**Problem:** Conflict detection compares raw registry content (with `{{shared_path}}` markers) against installed files (with resolved paths). Template comments aren't resolved before comparison.

**Fix applied:** Added `resolveFileMarkers()` in CLI write-capability and updated conflict detection.

---

### 9. Package Manager Detection Fails in Monorepo (1/5 frameworks: Express)

**Category:** Missing CLI feature · **Severity:** Blocker · **Status:** Resolved

**Problem:** `detectPackageManager()` only checks CWD for lockfiles. In a monorepo, lockfiles are at the root.

**Fix applied:** Updated CLI to walk up parent directories until a lockfile is found.

---

### 10. Next.js ESM `.js` Extension Incompatibility (1/5 frameworks: Next.js)

**Category:** Import issue · **Severity:** Blocker · **Status:** Resolved

**Problem:** Backcap uses ESM-style `.js` extensions in TypeScript imports. Next.js webpack can't resolve `.js` → `.ts` by default.

**Fix applied:** Added `webpack.resolve.extensionAlias` config in `next.config.ts`.

**Recommended follow-up:**
- **Issue: CLI `init` should add `extensionAlias` for Next.js projects** automatically.

---

### 11. NestJS DI System Clash — Pure DI vs @Injectable (1/5 frameworks: NestJS)

**Category:** Wiring confusion · **Severity:** Annoyance · **Status:** Resolved

**Problem:** Backcap uses Pure DI (factory functions returning plain objects). NestJS expects `@Injectable()` classes with decorator-based DI.

**Fix applied:** `DynamicModule` with `useFactory` pattern bridges the two systems. NestJS adapter uses a wiring guide instead of code adapter.

**Impact:** Highest-friction framework. The `DynamicModule.register()` + wiring guide pattern is the recommended approach. A dedicated NestJS adapter category is NOT needed.

---

### 12. Prisma v7 Requires Driver Adapter (1/5 frameworks: Express)

**Category:** Wiring confusion · **Severity:** Annoyance · **Status:** Resolved

**Problem:** Prisma v7 requires an explicit driver adapter (`PrismaLibSql`, `PrismaPg`, etc.). Backcap's Prisma adapter types don't reflect this.

**Fix applied:** Added `@prisma/adapter-libsql` and `@libsql/client` in the example.

---

### 13. Next.js Adapter — Not in KNOWN_ADAPTERS (1/5 frameworks: Next.js)

**Category:** Missing CLI feature · **Severity:** Annoyance · **Status:** Resolved

**Problem:** `next` was not in the `KNOWN_ADAPTERS` list in `detect-adapters.ts`.

**Fix applied:** Added `next` to `KNOWN_ADAPTERS`.

---

## Cross-Framework Patterns

Issues affecting **multiple frameworks** indicate systemic problems that should be prioritized:

| Pattern | Frameworks Affected | Priority |
|---------|:---:|:---:|
| Bridge shared infrastructure not scaffolded | 5/5 | **Critical** |
| Adapter relative import paths off-by-one | 4/5 | **Critical** |
| HTTP adapters not published to registry | 4/5 | High |
| Search adapters missing entirely | 5/5 (2 explicit, all affected) | High |
| Prisma schema fragment not auto-merged | 3/5 | Medium |

---

## Adapter Coverage Matrix

### HTTP Adapters (Framework → Capability)

| Capability | Express | Fastify | Hono | NestJS | Next.js |
|------------|:---:|:---:|:---:|:---:|:---:|
| blog | ✅ | ✅ | ✅ | ✅ (wiring guide) | ✅ |
| auth | ✅ | ❌ | ❌ | ❌ | ❌ |
| analytics | ✅ | ❌ | ❌ | ❌ | ❌ |
| audit-log | ✅ | ❌ | ❌ | ❌ | ❌ |
| billing | ✅ | ❌ | ❌ | ❌ | ❌ |
| cart | ✅ | ❌ | ❌ | ❌ | ❌ |
| catalog | ✅ | ❌ | ❌ | ❌ | ❌ |
| comments | ✅ | ❌ | ❌ | ❌ | ❌ |
| feature-flags | ✅ | ❌ | ❌ | ❌ | ❌ |
| files | ✅ | ❌ | ❌ | ❌ | ❌ |
| forms | ✅ | ❌ | ❌ | ❌ | ❌ |
| media | ✅ | ❌ | ❌ | ❌ | ❌ |
| notifications | ✅ | ❌ | ❌ | ❌ | ❌ |
| orders | ✅ | ❌ | ❌ | ❌ | ❌ |
| organizations | ✅ | ❌ | ❌ | ❌ | ❌ |
| queues | ✅ | ❌ | ❌ | ❌ | ❌ |
| rbac | ✅ | ❌ | ❌ | ❌ | ❌ |
| tags | ✅ | ❌ | ❌ | ❌ | ❌ |
| webhooks | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Total** | **19/19** | **1/19** | **1/19** | **1/19** | **1/19** |

### Persistence Adapters (Prisma)

| Status | Count |
|--------|:---:|
| Prisma adapters available | 19/19 capabilities |
| All frameworks share the same Prisma adapters | ✅ |

### Search Adapters

| Adapter | Status |
|---------|:---:|
| search-prisma | ❌ Not created |
| search-express | ❌ Not created |
| search-fastify | ❌ Not created |
| search-hono | ❌ Not created |
| search-nestjs | ❌ Not created |
| search-nextjs | ❌ Not created |

---

## Landing Page Claims Validation

### Framework Claims

The landing page (`apps/docs/src/pages/index.astro`) claims support for:

| Claim | Status | Evidence |
|-------|:---:|---------|
| **Express** | ✅ Validated | Full adapter coverage (19 capabilities). Express blog example passes all tests. |
| **Fastify** | ⚠️ Partial | Blog adapter only (1/19 capabilities). Fastify blog example passes all tests. Core architecture works — adapter pattern maps cleanly to Fastify plugins. |
| **Hono** | ⚠️ Partial | Blog adapter only (1/19 capabilities). Hono blog example passes all tests. Adapter pattern handles Hono's context-based API well. |
| **NestJS** | ⚠️ Partial | Wiring guide only — no code adapter (by design). NestJS blog example passes all tests. `DynamicModule` + `useFactory` bridges Pure DI and NestJS DI effectively. |
| **Next.js** | ⚠️ Partial | Blog adapter only (1/19 capabilities). Next.js blog example passes all tests. Requires webpack `extensionAlias` config. File-based routing requires a different adapter shape. |

### Runtime Claims

| Claim | Status | Evidence |
|-------|:---:|---------|
| **Node** | ✅ Validated | All 5 examples run on Node.js and pass tests. |
| **Bun** | ❌ Not tested | No example tested on Bun. Hono adapter is designed for multi-runtime (no Node-specific APIs). Other adapters use Node-specific frameworks (Express, Fastify, NestJS). |
| **Deno** | ❌ Not tested | No example tested on Deno. Similar to Bun — Hono could work, but framework-specific adapters (Express, Fastify, NestJS) are Node-native. |

### Recommended LP Updates

1. **Runtime tags:** Consider adding a visual indicator (e.g., tooltip or asterisk) distinguishing "tested" from "theoretically supported" runtimes. Bun and Deno are architecturally compatible but not validated.
2. **Framework tags:** All 5 claimed frameworks are validated with working blog examples. Express has full adapter coverage; others have blog-only coverage.

---

## Resulting Issues / Follow-up Stories

Priority-ordered list of issues identified from this analysis:

### Critical (Cross-framework blockers)

1. **CLI: Auto-scaffold `src/shared/` infrastructure when installing bridges**
   Affects: All frameworks. Bridge installation should include `event-bus.port.ts`, `bridge.ts`, and `in-memory-event-bus.ts`.

2. **Template system: Resolve capability cross-references in adapter imports**
   Affects: Express, Fastify, Hono, NestJS. The template marker system should handle `{{capabilities_path}}` in addition to `{{shared_path}}`.

### High (Adapter gaps)

3. **Publish all framework adapters to GitHub Pages registry**
   Affects: Fastify, Hono, NestJS, Next.js. Adapter source code exists but isn't published.

4. **Create search adapters (Prisma + HTTP per framework)**
   Affects: All frameworks. Search is on the LP but has zero adapter support.

5. **Expand Fastify/Hono/Next.js HTTP adapters beyond blog**
   Gap: Express has 19 capability adapters; others have 1.

### Medium (Developer experience)

6. **CLI `add`: Auto-merge Prisma schema fragments**
   Affects: All frameworks using Prisma. Currently requires manual copy-paste.

7. **CLI `init`: Add webpack `extensionAlias` for Next.js projects**
   Affects: Next.js. Every Backcap + Next.js project needs this config.

8. **Factory: Preserve domain events in `createBlogService()`**
   Affects: All frameworks using bridges. Factory wraps away events needed by bridges.

9. **IndexDocument use case: Auto-create index if missing**
   Affects: All frameworks using search. Guard prevents first document indexing.

### Low (Documentation / polish)

10. **Document Bun/Deno runtime support with working examples**
    LP claims these runtimes but no examples validate them.

11. **Document NestJS `DynamicModule.register()` pattern prominently**
    Highest-friction framework — the wiring guide pattern should be easy to find.

12. **Document Prisma v7 driver adapter requirement**
    New Prisma versions require explicit driver adapters.

---

## Conclusion

Backcap's clean architecture and adapter pattern are **validated across all 5 frameworks**. The core domain and application layers are 100% shared — only HTTP adapters and server wiring differ. This confirms the "framework agnostic by design" LP claim.

The main gaps are:
- **Tooling:** The CLI's template system needs to handle more import resolution patterns (shared infrastructure, capability cross-references)
- **Coverage:** Express has full adapter coverage (19 capabilities); other frameworks have blog-only
- **Search:** A core LP capability with zero adapter support
- **Runtimes:** Bun and Deno are claimed but untested

All 33 friction points encountered during Epic 12 were resolved during stop-and-fix. The 5 examples serve as integration tests — all pass their test suites.
