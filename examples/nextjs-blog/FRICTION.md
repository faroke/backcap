# Friction Log — Next.js Blog Example

## Friction Point 1: Next.js HTTP adapter not yet published

**Step:** `backcap add blog -y`
**Warning:** No `blog-nextjs` adapter detected or installed. Only `blog-prisma` was installed.
**Root cause:** The Next.js adapter exists in the registry source (`packages/registry/adapters/nextjs/blog/`) but hasn't been published to the GitHub Pages registry yet. The CLI detects Next.js and knows the framework, but `next` is not yet in the `KNOWN_ADAPTERS` list in `detect-adapters.ts`.
**Fix applied:** Added `next` to `KNOWN_ADAPTERS` in `packages/cli/src/lib/detect-adapters.ts`. Manually copied the adapter into the example project at `src/adapters/http/nextjs/blog/`. The adapter will be available after the next registry build + deploy.

## Friction Point 2: ESM .js import extensions incompatible with Next.js webpack

**Step:** `next build`
**Error:** `Module not found: Can't resolve '../capabilities/blog/contracts/index.js'` — and similar errors for all `.js` extension imports.
**Root cause:** Backcap capabilities and bridges use ESM-style `.js` extensions in TypeScript imports (e.g., `import { X } from "./foo.js"`). This is standard for pure ESM projects. However, Next.js uses webpack for bundling, which resolves TypeScript files directly without `.js` → `.ts` extension mapping by default.
**Fix applied:** Added `webpack.resolve.extensionAlias` to `next.config.ts`:
```typescript
webpack: (config) => {
  config.resolve.extensionAlias = {
    ".js": [".ts", ".tsx", ".js"],
  };
  return config;
},
```
**Impact:** This is the most significant Next.js-specific friction point. Every Backcap project using Next.js will need this webpack config. Consider adding it to the CLI's `init` command for Next.js projects, or documenting it prominently.

## Friction Point 3: Bridge imports reference non-existent shared paths (same as Express/Fastify/Hono)

**Step:** Wire bridge in `src/lib/services.ts`
**Error:** TypeScript error — `IEventBus` and `Bridge` interfaces don't exist at expected paths.
**Root cause:** Bridge files reference `IEventBus` and `Bridge` interfaces with relative paths that rely on a `shared/` directory. Same issue as documented in Express, Fastify, Hono, and NestJS examples.
**Fix applied:** Manually created `src/shared/event-bus.port.ts`, `src/shared/bridge.ts`, and `src/shared/in-memory-event-bus.ts`. Fixed bridge imports to point to `../../shared/`.

## Friction Point 4: Search adapters not published (same as NestJS)

**Step:** `backcap add search -y`
**Warning:** `Could not fetch adapter "search-prisma", skipping.`
**Root cause:** Search adapters haven't been published to the registry yet.
**Fix applied:** Manually created `src/adapters/in-memory-search-engine.ts` implementing `ISearchEngine` port.

## Friction Point 5: Prisma client must be generated before build

**Step:** `next build` before `prisma generate`
**Error:** `Module not found: Can't resolve '../generated/prisma/client.js'`
**Root cause:** Prisma v7 generates the client into a project-local directory (`src/generated/prisma/`). This directory doesn't exist until `prisma generate` or `prisma migrate dev` is run. In serverless/CI environments, this step is easy to forget.
**Impact:** Not a bug — standard Prisma workflow. But worth noting for the README setup steps. The `postinstall` script pattern (`"postinstall": "prisma generate"`) is recommended for CI.

## Friction Point 6: Next.js serverless model requires singleton pattern

**Step:** Wire Backcap services in API route handlers
**Observation:** Unlike Express/Fastify/Hono where services are created once at startup, Next.js API routes are serverless functions. Each request potentially runs in a fresh context (production) or the same context with HMR (development).
**Pattern used:** `globalThis` singleton pattern — services are cached on `globalThis` in development to survive HMR, and created fresh per cold start in production. This is the standard Next.js pattern for database clients and is well-documented.
**Impact:** Backcap's factory pattern (Pure DI) works well here. The `createBlogService()` factory is lightweight — it just wires use cases to ports. Cold start overhead is negligible. The main concern is database connection pooling (handled by Prisma's own connection management).

## Friction Point 7: Next.js file-based routing requires adapter pattern change

**Step:** Create HTTP adapter for Next.js
**Observation:** Express/Fastify/Hono adapters export a single `createBlogRouter()` or `createBlogRoutes()` function that registers all routes on a router/app instance. This doesn't work for Next.js because each route is a separate file (`app/api/posts/route.ts`, `app/api/posts/[id]/route.ts`, etc.).
**Pattern used:** The Next.js adapter exports `createBlogRouteHandlers()` which returns a structured object with handlers grouped by route:
```typescript
const handlers = createBlogRouteHandlers(blogService);
// handlers.posts.GET, handlers.posts.POST
// handlers.postById.GET
// handlers.publish.PUT
```
Each route file then delegates to the appropriate handler. This keeps route files thin (3-4 lines each) while centralizing the adapter logic.
**Impact:** This is a fundamental architectural difference, not a friction. The adapter pattern adapts naturally — the export shape changes but the internal logic (error mapping, request parsing) is identical to other adapters.

## Summary

Next.js introduces **two unique friction points** beyond the shared ones:

1. **ESM `.js` extension incompatibility** — requires webpack `extensionAlias` config (friction point 2)
2. **File-based routing** — requires a different adapter shape (handler object vs. router registration) (friction point 7)

The **serverless model** (friction point 6) is actually a non-issue: Backcap's Pure DI factory pattern is lightweight and works well with `globalThis` caching. Cold start overhead is negligible.

Shared friction points (bridge imports, unpublished adapters, search adapters) remain consistent with all other examples.

**Verdict:** Backcap's architecture adapts well to Next.js. The factory/Pure DI pattern is serverless-friendly by design. The main actionable fix is adding `extensionAlias` to the CLI's `init` command for Next.js projects.
