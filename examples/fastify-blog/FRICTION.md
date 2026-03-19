# Friction Log — Fastify Blog Example

## Friction Point 1: Fastify HTTP adapter not yet published

**Step:** `backcap add blog -y`
**Warning:** `Could not fetch adapter "blog-fastify", skipping.`
**Root cause:** The Fastify adapter exists in the registry source (`packages/registry/adapters/fastify/blog/`) but hasn't been published to the GitHub Pages registry yet. The CLI detects Fastify and knows `blog-fastify` should exist, but cannot fetch it.
**Fix applied:** Manually copied the adapter from the registry source into the example project at `src/adapters/http/fastify/blog/`. The adapter will be available after the next registry build + deploy.

## Friction Point 2: Bridge imports reference non-existent shared paths (same as Express)

**Step:** Wire bridge in `src/server.ts`
**Error:** TypeScript error — `../../../shared/src/event-bus.port.js` and `../../../shared/src/bridge.js` don't exist.
**Root cause:** Bridge files reference `IEventBus` and `Bridge` interfaces with hardcoded relative paths that don't resolve in the user's project structure. Same issue as documented in Express example.
**Fix applied:** Manually created `src/shared/event-bus.port.ts`, `src/shared/bridge.ts`, and `src/shared/in-memory-event-bus.ts`. Fixed bridge imports to point to `../../shared/`.

## Friction Point 3: Adapter imports have wrong relative paths (same as Express)

**Step:** TypeScript compilation
**Error:** `Cannot find module '../../../capabilities/blog/...'` — off by one directory level.
**Root cause:** Adapters are installed with a category directory (e.g., `persistence/`) making them one level deeper than the hardcoded relative imports expect. Additionally, the Prisma adapter uses a bare path `src/capabilities/...` instead of a relative path.
**Fix applied:** Corrected imports in `post-repository.adapter.ts` to use `../../../../capabilities/...` (4 levels up instead of 3).

## Friction Point 4: Fastify plugin registration differs from Express

**Step:** Wire blog routes with Fastify
**Observation:** Express uses `app.use(router)` / inline routes. Fastify uses `fastify.register(plugin, { prefix })`. The Fastify adapter exports a plugin factory (`createBlogPlugin`) that returns an async plugin function — this maps naturally to `fastify.register()`.
**Impact:** Not a bug, but a design difference. The adapter pattern correctly abstracts this: Express adapter returns a Router, Fastify adapter returns a plugin. Both take an `IBlogService` and produce framework-native routing.
**No fix needed:** The adapter pattern handles this cleanly.

## Summary

Most friction points are **inherited from the Express example** (bridge imports, adapter paths). The Fastify-specific friction is minimal — mainly that the adapter hasn't been published yet. The adapter pattern works well: domain and application layers are identical between Express and Fastify examples; only the HTTP adapter and server wiring differ.
