# Friction Log — Hono Blog Example

## Friction Point 1: Hono HTTP adapter not yet published

**Step:** `backcap add blog -y`
**Warning:** `Could not fetch adapter "blog-hono", skipping.`
**Root cause:** The Hono adapter exists in the registry source (`packages/registry/adapters/hono/blog/`) but hasn't been published to the GitHub Pages registry yet. The CLI detects Hono and knows `blog-hono` should exist, but cannot fetch it.
**Fix applied:** Manually copied the adapter from the registry source into the example project at `src/adapters/http/hono/blog/`. The adapter will be available after the next registry build + deploy.

## Friction Point 2: Bridge imports reference non-existent shared paths (same as Express/Fastify)

**Step:** Wire bridge in `src/server.ts`
**Error:** TypeScript error — `../../../shared/src/event-bus.port.js` and `../../../shared/src/bridge.js` don't exist.
**Root cause:** Bridge files reference `IEventBus` and `Bridge` interfaces with hardcoded relative paths that don't resolve in the user's project structure. Same issue as documented in Express and Fastify examples.
**Fix applied:** Manually created `src/shared/event-bus.port.ts`, `src/shared/bridge.ts`, and `src/shared/in-memory-event-bus.ts`. Fixed bridge imports to point to `../../shared/`.

## Friction Point 3: Adapter imports have wrong relative paths (same as Express/Fastify)

**Step:** TypeScript compilation
**Error:** `Cannot find module '../../../capabilities/blog/...'` — off by one directory level.
**Root cause:** Adapters are installed with a category directory (e.g., `http/hono/`) making them one level deeper than the hardcoded relative imports expect. The Prisma adapter uses a bare path `src/capabilities/...` instead of a relative path.
**Fix applied:** Corrected imports in adapter files to use proper relative paths (4 levels up instead of 3).

## Friction Point 4: Hono requires @hono/node-server for Node runtime

**Step:** Start server on Node.js
**Observation:** Unlike Express/Fastify which run natively on Node.js, Hono is runtime-agnostic and requires `@hono/node-server` to serve on Node.js. This is a known trade-off of Hono's multi-runtime design — the core library has no Node-specific APIs.
**Impact:** One additional dependency (`@hono/node-server`) compared to Express/Fastify. Not a bug, but worth noting.
**No fix needed:** This is by design. Document as an expected difference.

## Friction Point 5: Hono's route sub-app pattern differs from Express/Fastify

**Step:** Wire blog routes with prefix
**Observation:** Express uses `app.use('/api', router)`. Fastify uses `fastify.register(plugin, { prefix: '/api' })`. Hono uses `app.route('/api', subApp)` — a Hono instance can mount another Hono instance as a sub-app.
**Impact:** Not a bug. The adapter pattern correctly abstracts this: the `createBlogRoutes()` function takes a Hono-like app and registers routes on it. The sub-app approach is idiomatic Hono.
**No fix needed:** The adapter pattern handles this cleanly.

## Friction Point 6: Bun runtime not tested

**Step:** Test multi-runtime support
**Observation:** Bun was not available in the development environment. Hono is designed to work with Bun natively (no additional server package needed — Bun has built-in `Bun.serve()`). The adapter itself uses no Node-specific APIs, so it should work on Bun without changes. Only `src/server.ts` would need a Bun-specific entry point replacing `@hono/node-server` with `Bun.serve()`.
**No fix needed:** Document as a future verification.

## Summary

Most friction points are **inherited from Express/Fastify examples** (bridge imports, adapter paths, unpublished adapter). Hono-specific friction is minimal:
- One extra dependency (`@hono/node-server`) for Node runtime
- Slightly different sub-app mounting (`app.route()` vs `app.use()`)
- The adapter pattern works well: domain and application layers are identical across all three frameworks (Express, Fastify, Hono); only the HTTP adapter and server wiring differ

Hono validates that Backcap's adapter system handles lightweight/edge frameworks well. The minimal, context-based API (`c.req.json()`, `c.json()`) maps cleanly to the adapter pattern.
